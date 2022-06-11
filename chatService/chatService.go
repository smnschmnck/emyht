package chatService

import (
	"chat/auth/authService"
	"chat/auth/userService"
	"chat/dbHelpers/postgresHelper"
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v4/pgxpool"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate = validator.New()
var ctx = context.Background()

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

	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close()

	chatID := uuid.New().String()

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

	var dbChatID string
	createChatQuery := "INSERT INTO chats(chat_id, name, picture_url, chat_type) " +
		"VALUES ($1, '', '','one_on_one') " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, createChatQuery, chatID).Scan(&dbChatID)
	if err != nil {
		fmt.Print(err)
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertSelfQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES($1, $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertSelfQuery, reqUUID, chatID).Scan(&dbChatID)
	if err != nil {
		fmt.Println(err)
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertParticipantQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES((SELECT uuid FROM users WHERE email=$1), $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertParticipantQuery, req.ParticipantEmail, chatID).Scan(&dbChatID)
	if err != nil {
		fmt.Println(err)
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	return c.SendString("SUCCESS")
}
