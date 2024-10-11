package chatService

import (
	"chat/authService"
	"chat/chatHelpers"
	"chat/contactService"
	"chat/dbHelpers/postgresHelper"
	"chat/pusher"
	"chat/s3Helpers"
	"chat/userService"
	"context"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/labstack/echo/v4"
	pusherLib "github.com/pusher/pusher-http-go/v5"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func StartOneOnOneChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type startReq struct {
		ParticipantUUID string `json:"participantUUID" validate:"required"`
	}
	req := new(startReq)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	contacts, err := contactService.GetUserContactsbyUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	isInContacts := false
	for _, c := range contacts {
		if c.Uuid == req.ParticipantUUID {
			isInContacts = true
			break
		}
	}
	if !isInContacts {
		return c.String(http.StatusInternalServerError, "USER NOT IN CONTACTS")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close()

	//Complex SQL Query ahead
	/*
		SELECT ALL one_on_one chats which belong to one of two UUIDs
		If the same chat_id exists for both UUIDs (twice) it must mean
		that a one_on_one chat must already exist between both uuids
	*/
	checkChatExistsQuery := "SELECT count(user_chat.chat_id) >= 2 AS chatcount " +
		"FROM user_chat " +
		"JOIN chats c on user_chat.chat_id = c.chat_id " +
		"WHERE chat_type='one_on_one' " +
		"AND (uuid=$1 OR uuid=$2) " +
		"GROUP BY c.chat_id " +
		"ORDER BY chatcount DESC " +
		"LIMIT 1"
	var chatExists bool
	err = conn.QueryRow(ctx, checkChatExistsQuery, reqUUID, req.ParticipantUUID).Scan(&chatExists)
	if err != nil {
		if err.Error() == "no rows in result set" {
			chatExists = false
		} else {
			return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
		}
	}
	if chatExists {
		return c.String(http.StatusConflict, "CHAT EXISTS ALREADY")
	}

	chatID := uuid.New().String()
	var dbChatID string
	createChatQuery := "INSERT INTO chats(chat_id, name, picture_url, chat_type, creation_timestamp) " +
		"VALUES ($1, '', '','one_on_one', $2) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, createChatQuery, chatID, time.Now().Unix()).Scan(&dbChatID)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	insertSelfIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES($1, $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertSelfIntoChatQuery, reqUUID, chatID).Scan(&dbChatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	insertParticipantIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES($1, $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertParticipantIntoChatQuery, req.ParticipantUUID, chatID).Scan(&dbChatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	err = pusher.PusherClient.Trigger(pusher.MakeUserFeedName(req.ParticipantUUID), pusher.NEW_CHAT, nil)
	if err != nil {
		fmt.Println(err)
	}

	chats, err := chatHelpers.GetChatsByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	return c.JSON(http.StatusOK, chats)
}

func StartGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type startReq struct {
		ChatName         string   `json:"chatName" validate:"required"`
		ChatPictureID    string   `json:"chatPictureID"`
		ParticipantUUIDs []string `json:"participantUUIDs" validate:"required"`
	}
	req := new(startReq)
	err = c.Bind(&req)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		fmt.Println(err)

		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	isInContacts, err := contactService.AreUsersInContacts(req.ParticipantUUIDs, reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if !isInContacts {
		return c.String(http.StatusUnauthorized, "NOT ALL USERS IN CONTACTS")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close()

	var chatPicture string
	if req.ChatPictureID != "" {
		imageKey := reqUUID + "/gcPictures/" + req.ChatPictureID + ".png"
		imageExists, err := s3Helpers.CheckFileExists(imageKey)
		if err != nil {
			return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
		}
		if !imageExists {
			return c.String(http.StatusNotFound, "IMAGEID NOT FOUND")
		}
		chatPicture = "storage.emyht.com/" + imageKey
	} else {
		randPictureInt := rand.Intn(10)
		defaultPicture := "default_group_" + strconv.Itoa(randPictureInt)
		chatPicture = defaultPicture
	}

	//CREATE CHAT
	chatID := uuid.New().String()
	var dbChatID string
	createChatQuery := "INSERT INTO chats(chat_id, name, picture_url, chat_type, creation_timestamp) " +
		"VALUES ($1, $2, $3,'group', $4) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, createChatQuery, chatID, req.ChatName, chatPicture, time.Now().Unix()).Scan(&dbChatID)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	//INSERT ALL PARTICIPANTS INTO CHAT
	rows := [][]any{}
	rows = append(rows, []any{reqUUID, chatID, 0})
	for _, p := range req.ParticipantUUIDs {
		rows = append(rows, []any{p, chatID, 0})
	}

	copyCount, err := conn.CopyFrom(
		ctx,
		pgx.Identifier{"user_chat"},
		[]string{"uuid", "chat_id", "unread_messages"},
		pgx.CopyFromRows(rows),
	)
	if err != nil || int(copyCount) != len(req.ParticipantUUIDs)+1 {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	chats, err := chatHelpers.GetChatsByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	pusherEvents := make([]pusherLib.Event, 0)
	for _, uuid := range req.ParticipantUUIDs {
		event := pusherLib.Event{
			Channel: pusher.MakeUserFeedName(uuid),
			Name:    pusher.NEW_CHAT,
			Data:    nil,
		}
		pusherEvents = append(pusherEvents, event)
	}
	pusher.PusherClient.TriggerBatch(pusherEvents)

	return c.JSON(http.StatusOK, chats)
}

func addUsersToGroupChat(participantUUIDs []string, uuid string, chatId string) ([]chatHelpers.SingleChat, error) {
	isInContacts, err := contactService.AreUsersInContacts(participantUUIDs, uuid)
	if err != nil {
		return make([]chatHelpers.SingleChat, 0), errors.New("INTERNAL ERROR")
	}

	if !isInContacts {
		return make([]chatHelpers.SingleChat, 0), errors.New("NOT ALL USERS IN CONTACTS")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return make([]chatHelpers.SingleChat, 0), errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	//CHECK IF CHAT EXISTS
	var dbChatID string
	checkChatQuery := "SELECT chat_id FROM chats WHERE chat_id = $1"
	err = conn.QueryRow(ctx, checkChatQuery, chatId).Scan(&dbChatID)
	if err != nil {
		return make([]chatHelpers.SingleChat, 0), errors.New("CHAT NOT FOUND")
	}

	//CHECK IF CHAT IS GROUP CHAT
	var chatType string
	checkChatTypeQuery := "SELECT chat_type FROM chats WHERE chat_id = $1"
	err = conn.QueryRow(ctx, checkChatTypeQuery, dbChatID).Scan(&chatType)
	if err != nil {
		return make([]chatHelpers.SingleChat, 0), errors.New("INTERNAL ERROR")
	}

	if chatType != "group" {
		return make([]chatHelpers.SingleChat, 0), errors.New("CHAT IS NOT GROUP CHAT")
	}

	//CHECK IF USER IS IN CHAT
	userInChat, err := chatHelpers.IsUserInChat(uuid, dbChatID)
	if err != nil {
		return make([]chatHelpers.SingleChat, 0), errors.New("INTERNAL ERROR")
	}

	if !userInChat {
		return make([]chatHelpers.SingleChat, 0), errors.New("NO AUTH")
	}

	//INSERT ALL PARTICIPANTS INTO CHAT
	rows := [][]any{}
	for _, p := range participantUUIDs {
		rows = append(rows, []any{p, dbChatID, 0})
	}

	copyCount, err := conn.CopyFrom(
		ctx,
		pgx.Identifier{"user_chat"},
		[]string{"uuid", "chat_id", "unread_messages"},
		pgx.CopyFromRows(rows),
	)

	if err != nil || int(copyCount) != len(participantUUIDs) {
		return make([]chatHelpers.SingleChat, 0), errors.New("INTERNAL ERROR")
	}

	chats, err := chatHelpers.GetChatsByUUID(uuid)
	if err != nil {
		return make([]chatHelpers.SingleChat, 0), errors.New("INTERNAL ERROR")
	}

	//TODO Sent websocket event

	return chats, nil
}

func AddUsersToGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type request struct {
		ParticipantUUIDs []string `json:"participantUUIDs"`
		ChatID           string   `json:"chatID"`
	}

	req := new(request)
	if err := c.Bind(req); err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	chats, err := addUsersToGroupChat(req.ParticipantUUIDs, reqUUID, req.ChatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, chats)
}

func GetChatParticipantsExceptUser(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type request struct {
		ChatID string `json:"chatID"`
	}

	req := new(request)
	if err := c.Bind(req); err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	chatParticipants, err := getChatMembers(req.ChatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	inChat := false
	for _, p := range chatParticipants {
		if p != reqUUID {
			inChat = true
			break
		}
	}

	if !inChat {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	var participantsExceptUser []string
	for _, p := range chatParticipants {
		if p != reqUUID {
			participantsExceptUser = append(participantsExceptUser, p)
		}
	}

	return c.JSON(http.StatusOK, participantsExceptUser)
}

func GetChats(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chats, err := chatHelpers.GetChatsByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	for i, chat := range chats {
		chats[i].PictureUrl = s3Helpers.FormatPictureUrl(chat.PictureUrl)
	}

	return c.JSON(http.StatusOK, chats)
}

func SendMessage(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type reqBody struct {
		ChatID      string `json:"chatID" validate:"required"`
		TextContent string `json:"textContent"`
		MessageType string `json:"messageType" validate:"required"`
		FileID      string `json:"fileID"`
	}

	req := new(reqBody)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	if len(req.TextContent) > 4096 {
		return c.String(http.StatusBadRequest, "MESSAGE TOO LONG")
	}

	//make sure platform only media URLs are being sent. TLDR: More comprehensive validation
	fileExists := len(req.FileID) > 0
	formattedFileID := ""
	if fileExists {
		if req.MessageType == "plaintext" {
			return c.String(http.StatusBadRequest, "FILES NOT ALLOWED FOR TYPE PLAINTEXT")
		}
		formattedFileID = "storage.emyht.com/" + reqUUID + "/userData/" + req.FileID
	}

	if req.MessageType == "plaintext" && len(req.TextContent) < 1 {
		return c.String(http.StatusBadRequest, "MESSAGE TOO SHORT")
	}

	inChat, err := chatHelpers.IsUserInChat(reqUUID, req.ChatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	if !inChat {
		return c.String(http.StatusUnauthorized, "USER NOT IN CHAT")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close()

	messageQuery := "INSERT INTO chatmessages(message_id, chat_id, sender_id, text_content, message_type, media_url, timestamp, delivery_status) " +
		"VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent') " +
		"RETURNING message_id"

	rows := conn.QueryRow(ctx, messageQuery, uuid.New(), req.ChatID, reqUUID, req.TextContent, req.MessageType, formattedFileID, time.Now().Unix())
	var messageID string
	err = rows.Scan(&messageID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	var chatID string
	//add into chats as last_message_id
	lastChatMessageQuery := "UPDATE chats " +
		"SET last_message_id=$1 " +
		"WHERE chat_id=$2 " +
		"RETURNING chat_id"
	rows = conn.QueryRow(ctx, lastChatMessageQuery, messageID, req.ChatID)
	err = rows.Scan(&chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	querySuccess := false
	incrementUnreadMessagesQuery := "UPDATE user_chat " +
		"SET unread_messages=(unread_messages + 1) " +
		"WHERE chat_id=$1 AND uuid!=$2 " +
		"RETURNING true"
	rows = conn.QueryRow(ctx, incrementUnreadMessagesQuery, chatID, reqUUID)
	err = rows.Scan(&querySuccess)
	if err != nil || !querySuccess {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	messages, err := getMessagesByChatID(chatID, reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	err = sendNewMessageNotification(chatID)
	if err != nil {
		fmt.Println(err)
	}

	return c.JSON(http.StatusOK, messages)
}

type singleMessage struct {
	MessageID      string `json:"messageID" validate:"required"`
	SenderID       string `json:"senderID" validate:"required"`
	SenderUsername string `json:"senderUsername" validate:"required"`
	TextContent    string `json:"textContent" validate:"required"`
	MessageType    string `json:"messageType" validate:"required"`
	MediaUrl       string `json:"mediaUrl" validate:"required"`
	Timestamp      int    `json:"timestamp" validate:"required"`
	DeliveryStatus string `json:"deliveryStatus" validate:"required"`
}

func getMessagesByChatID(chatID string, uuid string) ([]singleMessage, error) {
	inChat, err := chatHelpers.IsUserInChat(uuid, chatID)
	if err != nil {
		return make([]singleMessage, 0), err
	}
	if !inChat {
		return make([]singleMessage, 0), errors.New("USER NOT IN CHAT")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return make([]singleMessage, 0), errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	query := "SELECT message_id, sender_id, username AS sender_username, text_content, message_type, media_url, timestamp, delivery_status " +
		"FROM chatmessages " +
		"JOIN users u on u.uuid = chatmessages.sender_id " +
		"WHERE chat_id=$1 " +
		"ORDER BY timestamp ASC"
	var messages []singleMessage
	err = pgxscan.Select(ctx, conn, &messages, query, chatID)
	if err != nil {
		return make([]singleMessage, 0), errors.New("INTERNAL ERROR")
	}

	if messages == nil {
		return make([]singleMessage, 0), nil
	}

	for i, message := range messages {
		messages[i].MediaUrl = s3Helpers.FormatPictureUrl(message.MediaUrl)
	}

	return messages, nil
}

func GetMessages(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}

	messages, err := getMessagesByChatID(chatID, reqUUID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	err = markChatAsRead(reqUUID, chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, messages)
}

func markChatAsRead(uuid string, chatID string) error {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return errors.New("INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	querySuccess := false
	query := "UPDATE user_chat " +
		"SET unread_messages=0 " +
		"WHERE chat_id=$1 AND uuid=$2 " +
		"RETURNING true"
	rows := conn.QueryRow(ctx, query, chatID, uuid)
	err = rows.Scan(&querySuccess)
	if err != nil || !querySuccess {
		return errors.New("INTERNAL ERROR")
	}

	return nil
}

func getChatMembers(chatId string) ([]string, error) {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return nil, err
	}
	defer conn.Close(ctx)

	query := "SELECT uuid " +
		"FROM user_chat " +
		"WHERE chat_id = $1"
	var uuids []string
	err = pgxscan.Select(ctx, conn, &uuids, query, chatId)
	if err != nil {
		return nil, err
	}
	return uuids, nil
}

func sendNewMessageNotification(chatId string) error {
	// chatmembers, err := getChatMembers(chatId)
	// if err != nil {
	// 	return err
	// }

	// type newMessageNotification struct {
	// 	ChatID string `json:"chatID"`
	// }

	// body := newMessageNotification{
	// 	ChatID: chatId,
	// }

	//TODO Sent websocket event

	return nil
}

func GetChatInfo(c echo.Context) error {
	type chatInfoRes struct {
		Info string `json:"info"`
	}

	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}
	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}
	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}
	userInChat, err := chatHelpers.IsUserInChat(reqUUID, chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	if !userInChat {
		return c.String(http.StatusUnauthorized, "USER NOT IN CHAT")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	defer conn.Close()

	var isGroupChat bool
	isGroupChatQuery := "SELECT chat_type = 'group' " +
		"FROM chats " +
		"WHERE chat_id=$1"
	rows := conn.QueryRow(ctx, isGroupChatQuery, chatID)
	err = rows.Scan(&isGroupChat)
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if isGroupChat {
		var groupChatUsers int
		groupChatUsersQuery := "SELECT count(uuid) " +
			"FROM user_chat " +
			"WHERE chat_id = $1 " +
			"GROUP BY chat_id"
		rows := conn.QueryRow(ctx, groupChatUsersQuery, chatID)
		err := rows.Scan(&groupChatUsers)
		if err != nil {
			fmt.Println(err.Error())
			return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
		}
		out := fmt.Sprint(groupChatUsers) + " member"
		if groupChatUsers > 1 {
			out += "s"
		}
		return c.JSON(http.StatusOK, chatInfoRes{Info: out})
	}

	//TODO: Actually fetch last online
	return c.JSON(http.StatusOK, chatInfoRes{Info: "14:21"})
}

func GetMediaPutURL(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	const MEGABYTE int64 = 1000000
	const MAX_SIZE = 64 * MEGABYTE
	type reqBody struct {
		ContentLength int64  `json:"contentLength" validate:"required"`
		FileExtension string `json:"fileExtension" validate:"required"`
	}
	req := new(reqBody)
	err = c.Bind(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	if req.ContentLength > MAX_SIZE {
		return c.String(http.StatusBadRequest, "FILE TOO BIG")
	}

	fileID := uuid.New().String() + "." + req.FileExtension
	fileName := reqUUID + "/userData/" + fileID

	presignedPutUrl, err := s3Helpers.PresignPutObject(fileName, time.Hour, req.ContentLength)
	if err != nil {
		c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		FileID          string `json:"fileID"`
		PresignedPutUrl string `json:"presignedPutURL"`
	}

	return c.JSON(http.StatusOK, res{PresignedPutUrl: presignedPutUrl, FileID: fileID})
}

func GetGroupPicturePutURL(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	const MEGABYTE int64 = 1000000
	const MAX_SIZE = 1 * MEGABYTE
	type reqBody struct {
		ContentLength int64 `json:"contentLength" validate:"required"`
	}
	req := new(reqBody)
	err = c.Bind(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	if req.ContentLength > MAX_SIZE {
		return c.String(http.StatusBadRequest, "FILE TOO BIG")
	}

	fileID := uuid.New().String()
	fileName := reqUUID + "/gcPictures/" + fileID + ".png"

	presignedPutUrl, err := s3Helpers.PresignPutObject(fileName, time.Hour, req.ContentLength)
	if err != nil {
		c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		FileID          string `json:"fileID"`
		PresignedPutUrl string `json:"presignedPutURL"`
	}

	return c.JSON(http.StatusOK, res{PresignedPutUrl: presignedPutUrl, FileID: fileID})
}

func LeaveGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type leaveReq struct {
		ChatID string `json:"chatID" validate:"required"`
	}
	req := new(leaveReq)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	inChat, err := chatHelpers.IsUserInChat(reqUUID, req.ChatID)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if !inChat {
		return c.String(http.StatusUnauthorized, "NOT IN CHAT")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close()

	chatType := "false"
	query := "SELECT chat_type FROM chats WHERE chat_id=$1"
	rows := conn.QueryRow(ctx, query, req.ChatID)
	err = rows.Scan(&chatType)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if chatType != "group" {
		return c.String(http.StatusBadRequest, "NOT A GROUP CHAT")
	}

	leaveQuery := "DELETE FROM user_chat WHERE chat_id=$1 AND uuid=$2"
	r, err := conn.Query(ctx, leaveQuery, req.ChatID, reqUUID)
	r.Close()
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	chats, err := chatHelpers.GetChatsByUUID(reqUUID)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	return c.JSON(http.StatusOK, chats)
}

type simpleChat struct {
	ChatID     string `json:"chatID"`
	ChatName   string `json:"chatName"`
	PictureUrl string `json:"pictureUrl"`
}

func getGroupchatsNewUserIsNotPartOf(uuid string, newUserUUID string) ([]simpleChat, error) {
	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		log.Println(err)
		return nil, err
	}
	defer conn.Close()

	query := `SELECT c.chat_id, c.name AS chat_name, c.picture_url FROM user_chat uc
	JOIN chats c ON c.chat_id = uc.chat_id
	WHERE uuid = $1 AND c.chat_type != 'one_on_one'
	EXCEPT
	SELECT c.chat_id, c.name AS chat_name, c.picture_url FROM user_chat uc
	JOIN chats c ON c.chat_id = uc.chat_id
	WHERE uuid = $2 AND c.chat_type != 'one_on_one'`
	var chats []simpleChat
	err = pgxscan.Select(ctx, conn, &chats, query, uuid, newUserUUID)
	if err != nil {
		return nil, errors.New("INTERNAL ERROR")
	}

	return chats, nil
}

func GetGroupchatsNewUserIsNotPartOf(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type userReq struct {
		NewUserID string `json:"newUserID" validate:"required"`
	}
	req := new(userReq)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	groupChats, err := getGroupchatsNewUserIsNotPartOf(reqUUID, req.NewUserID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	for i, chat := range groupChats {
		groupChats[i].PictureUrl = s3Helpers.FormatPictureUrl(chat.PictureUrl)
	}

	return c.JSON(http.StatusOK, groupChats)
}

func AddSingleUserToGroupChats(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type addReq struct {
		ChatIDs         []string `json:"chatIDs" validate:"required"`
		ParticipantUUID string   `json:"participantUUID" validate:"required"`
	}
	req := new(addReq)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	participantUUIDAsSlice := []string{req.ParticipantUUID}
	userInContacts, err := contactService.AreUsersInContacts(participantUUIDAsSlice, reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	if !userInContacts {
		return c.String(http.StatusUnauthorized, "USER NOT IN CONTACTS")
	}

	potentialChats, err := getGroupchatsNewUserIsNotPartOf(reqUUID, req.ParticipantUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	for _, chatID := range req.ChatIDs {
		canAdd := false
		for _, potentialChat := range potentialChats {
			if chatID == potentialChat.ChatID {
				canAdd = true
				break
			}
		}
		if !canAdd {
			return c.String(http.StatusUnauthorized, "YOU ARE NOT ALLOWED TO ADD A USER TO ALL OF THESE CHATS")
		}
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close()

	rows := [][]any{}
	for _, chatID := range req.ChatIDs {
		rows = append(rows, []any{req.ParticipantUUID, chatID, 0})
	}

	copyCount, err := conn.CopyFrom(
		ctx,
		pgx.Identifier{"user_chat"},
		[]string{"uuid", "chat_id", "unread_messages"},
		pgx.CopyFromRows(rows),
	)

	if err != nil || int(copyCount) != len(req.ChatIDs) {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	//TODO Sent websocket event

	return c.String(http.StatusOK, "SUCCESS")
}

func GetOneOnOneChatParticipant(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}

	userInChat, err := chatHelpers.IsUserInChat(reqUUID, chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	if !userInChat {
		c.String(http.StatusUnauthorized, "YOU ARE NOT A PARTICIPANT OF THIS CHAT")
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return errors.New("INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	var participantUUID string
	query := `SELECT uuid FROM user_chat WHERE chat_id = $1 AND uuid != $2;`
	rows := conn.QueryRow(ctx, query, chatID, reqUUID)
	err = rows.Scan(&participantUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		ParticipantUUID string `json:"participantUUID"`
	}

	return c.JSON(http.StatusOK, res{ParticipantUUID: participantUUID})
}

func GetContactsNotInChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}

	chatMembers, err := getChatMembers(chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	contacts, err := contactService.GetUserContactsbyUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	contactsAsMap := make(map[string]contactService.Contact)

	for _, contact := range contacts {
		contactsAsMap[contact.Uuid] = contact
	}

	for _, chatMember := range chatMembers {
		delete(contactsAsMap, chatMember)
	}

	usersNotInChat := make([]contactService.Contact, len(contactsAsMap))

	i := 0
	for _, user := range contactsAsMap {
		usersNotInChat[i] = user
		i++
	}

	for i, contact := range usersNotInChat {
		contacts[i].PictureUrl = s3Helpers.FormatPictureUrl(contact.PictureUrl)
	}

	return c.JSON(http.StatusOK, usersNotInChat)
}
