package chatService

import (
	"chat/authService"
	"chat/contactService"
	"chat/dbHelpers/postgresHelper"
	"chat/userService"
	"chat/wsService"
	"context"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"sort"
	"strconv"
	"strings"
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

	sendUpdatedChats(req.ParticipantUUID)
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
		ChatPicture      string   `json:"chatPicture"`
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

	contacts, err := contactService.GetUserContactsbyUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	isInContacts := false
	for _, participant := range req.ParticipantUUIDs {
		isInContacts = false
		for _, contact := range contacts {
			if contact.Uuid == participant {
				isInContacts = true
				break
			}
		}
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
	if req.ChatPicture != "" {
		chatPicture = req.ChatPicture
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

	//TODO INSERT ALL PARTICIPANTS INTO CHAT
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

	for _, p := range req.ParticipantUUIDs {
		sendUpdatedChats(p)
	}

	return c.JSON(http.StatusOK, chats)
}

type singleChat struct {
	ChatID            string  `json:"chatID"`
	CreationTimestamp int     `json:"creationTimestamp"`
	Name              string  `json:"chatName"`
	PictureUrl        string  `json:"pictureUrl"`
	UnreadMessages    int     `json:"unreadMessages"`
	MessageType       *string `json:"messageType"`
	TextContent       *string `json:"textContent"`
	Timestamp         *int    `json:"timestamp"`
	DeliveryStatus    *string `json:"deliveryStatus"`
	SenderID          *string `json:"senderID"`
}

func getChatsByUUID(uuid string) ([]singleChat, error) {
	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return []singleChat{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	getChatsQuery := "SELECT c.chat_id, c.creation_timestamp, ( " +
		"CASE c.chat_type WHEN 'one_on_one' THEN ( " +
		"SELECT users.username AS name " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"WHERE c.chat_id=uc.chat_id AND uc.uuid!=$1 " +
		") ELSE c.name END " +
		"), " +
		"( " +
		"CASE c.chat_type WHEN 'one_on_one' THEN ( " +
		"SELECT users.picture_url AS picture_url " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"WHERE c.chat_id=uc.chat_id AND uc.uuid!=$1 " +
		") ELSE c.picture_url END " +
		"), " +
		"u.unread_messages, " +
		"m.message_type, " +
		"m.text_content, " +
		"m.timestamp, " +
		"m.delivery_status, " +
		"m.sender_id " +
		"FROM user_chat u " +
		"JOIN chats c ON u.chat_id = c.chat_id " +
		"LEFT JOIN chatmessages m ON m.message_id = c.last_message_id " +
		"WHERE u.uuid=$1"
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
		MediaUrl    string `json:"mediaUrl"`
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
	mediaUrlExists := len(req.MediaUrl) > 0
	if mediaUrlExists {
		if req.MessageType == "plaintext" {
			return c.String(http.StatusBadRequest, "MEDIA URL NOT ALLOWED FOR TYPE PLAINTEXT")
		}
		hasWrongDomain := !strings.HasPrefix(req.MediaUrl, "storage.emyht.com/")
		if hasWrongDomain {
			return c.String(http.StatusBadRequest, "BAD MEDIA URL DOMAIN")
		}
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

	rows := conn.QueryRow(ctx, messageQuery, uuid.New(), req.ChatID, reqUUID, req.TextContent, req.MessageType, req.MediaUrl, time.Now().Unix())
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
	MediaUrl       string `json:"medieUrl" validate:"required"`
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

func ConfirmReadChat(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type reqBody struct {
		ChatID string `json:"chatID" validate:"required"`
	}

	req := new(reqBody)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	err = markChatAsRead(reqUUID, req.ChatID)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
	}

	chats, err := getChatsByUUID(reqUUID)
	if err != nil {
		c.String(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, chats)
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
	uuids, err := getChatMembers(chatId)
	if err != nil {
		return err
	}

	//TODO also send chats
	type newMessageNotification struct {
		ChatID   string          `json:"chatID"`
		Messages []singleMessage `json:"messages"`
	}

	body := newMessageNotification{
		ChatID:   chatId,
		Messages: messages,
	}

	err = wsService.WriteStructToMultipleUUIDs(uuids, "message", body)

	for _, uuid := range uuids {
		err = sendUpdatedChats(uuid)
	}
	return err
}

func sendUpdatedChats(uuid string) error {
	chats, err := getChatsByUUID(uuid)
	if err != nil {
		return err
	}
	return wsService.WriteStructToSingleUUID(uuid, "chat", chats)
}
