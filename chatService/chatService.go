package chatService

import (
	"chat/authService"
	"chat/contactService"
	"chat/dbHelpers/postgresHelper"
	"chat/userService"
	"context"
	"fmt"
	"time"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate = validator.New()

func StartOneOnOneChat(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	type startReq struct {
		ParticipantUUID string `json:"participantUUID" validate:"required"`
	}
	var req startReq
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}

	contacts, err := contactService.GetUserContactsbyUUID(reqUUID)
	if err != nil {
		return c.Status(500).SendString(err.Error())
	}

	isInContacts := false
	for _, c := range contacts {
		if c.Uuid == req.ParticipantUUID {
			isInContacts = true
			break
		}
	}
	if !isInContacts {
		return c.Status(500).SendString("USER NOT IN CONTACTS")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
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
			return c.Status(500).SendString("INTERNAL ERROR")
		}
	}
	if chatExists {
		return c.Status(409).SendString("CHAT EXISTS ALREADY")
	}

	chatID := uuid.New().String()
	var dbChatID string
	createChatQuery := "INSERT INTO chats(chat_id, name, picture_url, chat_type) " +
		"VALUES ($1, '', '','one_on_one') " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, createChatQuery, chatID).Scan(&dbChatID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertSelfIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES($1, $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertSelfIntoChatQuery, reqUUID, chatID).Scan(&dbChatID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertParticipantIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES($1, $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertParticipantIntoChatQuery, req.ParticipantUUID, chatID).Scan(&dbChatID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	return c.SendString("SUCCESS")
}

func GetChats(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	type singleChat struct {
		ChatID         string  `json:"chatID"`
		Name           string  `json:"chatName"`
		PictureUrl     string  `json:"pictureUrl"`
		UnreadMessages int     `json:"unreadMessages"`
		MessageType    *string `json:"messageType"`
		TextContent    *string `json:"textContent"`
		Timestamp      *int    `json:"timestamp"`
		DeliveryStatus *string `json:"deliveryStatus"`
		SenderID       *string `json:"senderID"`
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close()

	getChatsQuery := "SELECT c.chat_id, ( " +
		"CASE c.chat_type WHEN 'one_on_one' THEN ( " +
		"SELECT users.username AS name " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"JOIN chats c on uc.chat_id = c.chat_id " +
		"WHERE c.chat_type='one_on_one' AND uc.uuid!=$1 " +
		") ELSE c.name END " +
		"), " +
		"( " +
		"CASE c.chat_type WHEN 'one_on_one' THEN ( " +
		"SELECT users.picture_url AS picture_url " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"JOIN chats c on uc.chat_id = c.chat_id " +
		"WHERE c.chat_type='one_on_one' AND uc.uuid!=$1 " +
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
	err = pgxscan.Select(ctx, conn, &chats, getChatsQuery, reqUUID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	if chats == nil {
		return c.JSON(make([]string, 0))
	}

	return c.JSON(chats)
}

func SendMessage(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	//TODO check if user is in chat
	//TODO make sure platform only media URLs are being sent. TLDR: More comprehensive validation
	type reqBody struct {
		ChatID      string `json:"chatID" validate:"required"`
		TextContent string `json:"textContent" validate:"required"`
		MessageType string `json:"messageType" validate:"required"`
		MediaUrl    string `json:"mediaUrl"`
	}

	var req reqBody
	err = c.BodyParser(&req)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		fmt.Println(err)
		return c.Status(400).SendString("BAD REQUEST")
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	query := "INSERT INTO chatmessages(message_id, chat_id, sender_id, text_content, message_type, media_url, timestamp, delivery_status) " +
		"VALUES ($1, $2, $3, $4, $5, $6, $7, 'sent') " +
		"RETURNING message_id"

	rows := conn.QueryRow(ctx, query, uuid.New(), req.ChatID, reqUUID, req.TextContent, req.MessageType, req.MediaUrl, time.Now().Unix())
	var messageID string
	err = rows.Scan(&messageID)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	type resBody struct {
		MessageID string `json:"messageID"`
	}

	//TODO add into chats as last_message_id

	return c.JSON(resBody{MessageID: messageID})
}
