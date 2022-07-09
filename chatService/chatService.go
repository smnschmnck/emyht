package chatService

import (
	"chat/authService"
	"chat/dbHelpers/postgresHelper"
	"chat/userService"
	"context"
	"fmt"
	"strings"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate = validator.New()

func SendFriendRequest(c *fiber.Ctx) error {
	token, err := authService.GetBearer(c)
	if err != nil {
		return c.Status(401).SendString("NO AUTH")
	}
	type friendRequest struct {
		FriendEmail string `json:"friendEmail" validate:"required"`
	}
	var friendReq friendRequest
	err = c.BodyParser(&friendReq)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(friendReq)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}

	user, respErr := userService.GetUserBySessionID(token)
	if respErr.StatusCode >= 300 {
		return c.Status(respErr.StatusCode).SendString(respErr.Msg)
	}

	if user.Email == friendReq.FriendEmail {
		return c.Status(500).SendString("YOU CAN'T SEND A FRIEND REQUEST TO YOURSELF")
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	friendReqQuery := "INSERT INTO friends(sender, reciever, status) " +
		"VALUES ($1, (SELECT uuid FROM users WHERE email=$2), 'pending') " +
		"RETURNING status"

	rows := conn.QueryRow(ctx, friendReqQuery, user.Uuid, friendReq.FriendEmail)
	var status string
	err = rows.Scan(&status)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			return c.Status(409).SendString("DUPLICATE FRIEND REQUEST")
		}
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	return c.SendString("SUCCESS")
}

func StartOneOnOneChat(c *fiber.Ctx) error {
	type startReq struct {
		ParticipantEmail string `json:"participantEmail" validate:"required"`
	}
	var req startReq
	err := c.BodyParser(&req)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}

	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		c.Status(500).SendString("INTERNAL ERROR")
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
		"AND (uuid=$1 OR uuid=(SELECT uuid FROM users WHERE email=$2)) " +
		"GROUP BY c.chat_id " +
		"ORDER BY chatcount DESC " +
		"LIMIT 1"
	var chatExists bool
	err = conn.QueryRow(ctx, checkChatExistsQuery, reqUUID, req.ParticipantEmail).Scan(&chatExists)
	if err != nil {
		if err.Error() == "no rows in result set" {
			chatExists = false
		} else {
			fmt.Print(err)
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
		fmt.Print(err)
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertSelfIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES($1, $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertSelfIntoChatQuery, reqUUID, chatID).Scan(&dbChatID)
	if err != nil {
		fmt.Println(err)
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertParticipantIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES((SELECT uuid FROM users WHERE email=$1), $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertParticipantIntoChatQuery, req.ParticipantEmail, chatID).Scan(&dbChatID)
	if err != nil {
		fmt.Println(err)
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	return c.SendString("SUCCESS")
}

func GetChats(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		fmt.Println(responseErr)
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		fmt.Println(err)
		return c.Status(500).SendString("INTERNAL ERROR")
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
		fmt.Println(err)
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
		fmt.Println(err)
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	return c.JSON(chats)
}
