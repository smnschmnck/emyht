package chatService

import (
	"chat/authService"
	"chat/contactService"
	"chat/dbHelpers/postgresHelper"
	"chat/s3Helpers"
	"chat/userService"
	"chat/wsService"
	"context"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"time"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/labstack/echo/v4"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func StartOneOnOneChat(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
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

	wsService.WriteEventToSingleUUID(req.ParticipantUUID, "chat")

	chats, err := getChatsByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	return c.JSON(http.StatusOK, chats)
}

func StartGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
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

	chats, err := getChatsByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	wsService.WriteEventToMultipleUUIDs(req.ParticipantUUIDs, "chat")

	return c.JSON(http.StatusOK, chats)
}

func addUsersToGroupChat(participantUUIDs []string, uuid string, chatId string) ([]singleChat, error) {
	isInContacts, err := contactService.AreUsersInContacts(participantUUIDs, uuid)
	if err != nil {
		return make([]singleChat, 0), errors.New("INTERNAL ERROR")
	}

	if !isInContacts {
		return make([]singleChat, 0), errors.New("NOT ALL USERS IN CONTACTS")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return make([]singleChat, 0), errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	//CHECK IF CHAT EXISTS
	var chatID string
	checkChatQuery := "SELECT chat_id FROM chats WHERE chat_id = $1"
	err = conn.QueryRow(ctx, checkChatQuery, chatID).Scan(&chatID)
	if err != nil {
		return make([]singleChat, 0), errors.New("CHAT NOT FOUND")
	}

	//CHECK IF CHAT IS GROUP CHAT
	var chatType string
	checkChatTypeQuery := "SELECT chat_type FROM chats WHERE chat_id = $1"
	err = conn.QueryRow(ctx, checkChatTypeQuery, chatID).Scan(&chatType)
	if err != nil {
		return make([]singleChat, 0), errors.New("INTERNAL ERROR")
	}

	if chatType != "group" {
		return make([]singleChat, 0), errors.New("CHAT IS NOT GROUP CHAT")
	}

	//CHECK IF USER IS IN CHAT
	userInChat, err := isUserInChat(uuid, chatID)
	if err != nil {
		return make([]singleChat, 0), errors.New("INTERNAL ERROR")
	}

	if !userInChat {
		return make([]singleChat, 0), errors.New("NO AUTH")
	}

	//INSERT ALL PARTICIPANTS INTO CHAT
	rows := [][]any{}
	for _, p := range participantUUIDs {
		rows = append(rows, []any{p, chatID, 0})
	}

	copyCount, err := conn.CopyFrom(
		ctx,
		pgx.Identifier{"user_chat"},
		[]string{"uuid", "chat_id", "unread_messages"},
		pgx.CopyFromRows(rows),
	)

	if err != nil || int(copyCount) != len(participantUUIDs) {
		return make([]singleChat, 0), errors.New("INTERNAL ERROR")
	}

	chats, err := getChatsByUUID(uuid)
	if err != nil {
		return make([]singleChat, 0), errors.New("INTERNAL ERROR")
	}

	wsService.WriteEventToMultipleUUIDs(participantUUIDs, "chat")

	return chats, nil
}

func AddUsersToGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
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

type singleChat struct {
	ChatID            string  `json:"chatID"`
	ChatType          string  `json:"chatType"`
	CreationTimestamp int     `json:"creationTimestamp"`
	Name              string  `json:"chatName"`
	PictureUrl        string  `json:"pictureUrl"`
	UnreadMessages    int     `json:"unreadMessages"`
	MessageType       *string `json:"messageType"`
	TextContent       *string `json:"textContent"`
	Timestamp         *int    `json:"timestamp"`
	DeliveryStatus    *string `json:"deliveryStatus"`
	SenderID          *string `json:"senderID"`
	SenderUsername    *string `json:"senderUsername"`
}

func getChatsByUUID(uuid string) ([]singleChat, error) {
	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return []singleChat{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	getChatsQuery := "SELECT c.chat_id, " +
		"c.chat_type, " +
		"c.creation_timestamp, " +
		"(CASE c.chat_type " +
		"WHEN 'one_on_one' THEN (SELECT users.username AS name " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"WHERE c.chat_id = uc.chat_id " +
		"AND uc.uuid != $1) " +
		"ELSE c.name END " +
		"), " +
		"( " +
		"CASE c.chat_type " +
		"WHEN 'one_on_one' THEN (SELECT users.picture_url AS picture_url " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"WHERE c.chat_id = uc.chat_id " +
		"AND uc.uuid != $1) " +
		"ELSE c.picture_url END " +
		"), " +
		"u.unread_messages, " +
		"m.message_type, " +
		"m.text_content, " +
		"m.timestamp, " +
		"m.delivery_status, " +
		"m.sender_id, " +
		"(SELECT username AS sender_username FROM users WHERE users.uuid = m.sender_id) " +
		"FROM user_chat u " +
		"JOIN chats c ON u.chat_id = c.chat_id " +
		"LEFT JOIN chatmessages m ON m.message_id = c.last_message_id " +
		"WHERE u.uuid = $1"
	var chats []singleChat
	err = pgxscan.Select(ctx, conn, &chats, getChatsQuery, uuid)
	if err != nil {
		fmt.Println(err)
		return []singleChat{}, errors.New("INTERNAL ERROR")
	}

	if chats == nil {
		return make([]singleChat, 0), nil
	}

	sort.SliceStable(chats, func(i, j int) bool {
		var a int
		var b int
		c1 := chats[i]
		c2 := chats[j]
		t1 := c1.Timestamp
		t2 := c2.Timestamp
		if t1 != nil {
			a = *t1
		} else {
			a = c1.CreationTimestamp
		}
		if t2 != nil {
			b = *t2
		} else {
			b = c2.CreationTimestamp
		}
		return a > b
	})

	return chats, nil
}

func GetChats(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chats, err := getChatsByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	for i, chat := range chats {
		chats[i].PictureUrl = s3Helpers.FormatPictureUrl(chat.PictureUrl)
	}

	return c.JSON(http.StatusOK, chats)
}

func isUserInChat(uuid string, chatID string) (bool, error) {
	chats, err := getChatsByUUID(uuid)
	if err != nil {
		return false, err
	}
	for _, chat := range chats {
		if chat.ChatID == chatID {
			return true, nil
		}
	}
	return false, nil
}

func SendMessage(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
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

	inChat, err := isUserInChat(reqUUID, req.ChatID)
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

	err = sendNewMessageNotification(chatID, messages)
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
	inChat, err := isUserInChat(uuid, chatID)
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
	sessionID, responseErr := authService.GetBearer(c)
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

func sendNewMessageNotification(chatId string, messages []singleMessage) error {
	chatmembers, err := getChatMembers(chatId)
	if err != nil {
		return err
	}

	type newMessageNotification struct {
		ChatID string `json:"chatID"`
	}

	body := newMessageNotification{
		ChatID: chatId,
	}

	err = wsService.WriteStructToMultipleUUIDs(chatmembers, "message", body)

	return err
}

func GetChatInfo(c echo.Context) error {
	type chatInfoRes struct {
		Info string `json:"info"`
	}

	sessionID, responseErr := authService.GetBearer(c)
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
	userInChat, err := isUserInChat(reqUUID, chatID)
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
	sessionID, responseErr := authService.GetBearer(c)
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
	sessionID, responseErr := authService.GetBearer(c)
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
	sessionID, responseErr := authService.GetBearer(c)
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

	inChat, err := isUserInChat(reqUUID, req.ChatID)
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

	chats, err := getChatsByUUID(reqUUID)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	return c.JSON(http.StatusOK, chats)
}
