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

func SendContactRequest(c *fiber.Ctx) error {
	token, err := authService.GetBearer(c)
	if err != nil {
		return c.Status(401).SendString("NO AUTH")
	}
	type contactRequest struct {
		ContactEmail string `json:"contactEmail" validate:"required"`
	}
	var contactReq contactRequest
	err = c.BodyParser(&contactReq)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(contactReq)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}

	user, respErr := userService.GetUserBySessionID(token)
	if respErr.StatusCode >= 300 {
		return c.Status(respErr.StatusCode).SendString(respErr.Msg)
	}

	if user.Email == contactReq.ContactEmail {
		return c.Status(500).SendString("YOU CAN'T SEND A CONTACT REQUEST TO YOURSELF")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close()

	checkDuplicateQuery := "SELECT EXISTS( " +
		"SELECT 1 " +
		"FROM friends " +
		"WHERE reciever = $1 AND sender = (SELECT uuid FROM users WHERE email=$2) " +
		") "
	checkDuplicateRows := conn.QueryRow(ctx, checkDuplicateQuery, user.Uuid, contactReq.ContactEmail)
	var duplicateExists bool
	err = checkDuplicateRows.Scan(&duplicateExists)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	if duplicateExists {
		return c.Status(409).SendString(contactReq.ContactEmail + " ALREADY SENT A FRIEND REQUEST TO YOU")
	}

	contactReqQuery := "INSERT INTO friends(sender, reciever, status) " +
		"VALUES ($1, (SELECT uuid FROM users WHERE email=$2), 'pending') " +
		"RETURNING status"
	contactReqRows := conn.QueryRow(ctx, contactReqQuery, user.Uuid, contactReq.ContactEmail)
	var status string
	err = contactReqRows.Scan(&status)
	if err != nil {
		if strings.Contains(err.Error(), `null value in column "reciever" violates not-null constraint`) {
			return c.Status(404).SendString("USER DOES NOT EXIST")
		}
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			return c.Status(409).SendString("DUPLICATE CONTACT REQUEST")
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
		return c.Status(401).SendString("NOT AUTHORIZED")
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
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	insertParticipantIntoChatQuery := "INSERT INTO user_chat(uuid, chat_id, unread_messages) " +
		"VALUES((SELECT uuid FROM users WHERE email=$1), $2, 0) " +
		"RETURNING chat_id"
	err = conn.QueryRow(ctx, insertParticipantIntoChatQuery, req.ParticipantEmail, chatID).Scan(&dbChatID)
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

	return c.JSON(chats)
}

func GetContacts(c *fiber.Ctx) error {
	token, err := authService.GetBearer(c)
	if err != nil {
		return c.Status(401).SendString("NO AUTH")
	}
	uuid, err := userService.GetUUIDBySessionID(token)
	if err != nil {
		return c.Status(401).SendString("NO AUTH")
	}
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close(ctx)
	query := "SELECT u.username, u.uuid, u.picture_url " +
		"FROM friends " +
		"JOIN users u ON u.uuid = friends.sender OR friends.reciever = u.uuid " +
		"WHERE (reciever=$1 OR sender=$1) AND status='accepted' AND u.uuid != $1"
	type contact struct {
		Username   string `json:"name"`
		Uuid       string `json:"id"`
		PictureUrl string `json:"profilePictureUrl"`
	}
	var contacts []contact
	err = pgxscan.Select(ctx, conn, &contacts, query, uuid)
	if err != nil {
		fmt.Println(err)
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	if contacts == nil {
		return c.JSON(make([]string, 0))
	}
	return c.JSON(contacts)
}

func GetPendingContactRequests(c *fiber.Ctx) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}
	uuid, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	type singleContactRequest struct {
		SenderID             string `json:"senderID"`
		SenderUsername       string `json:"senderUsername"`
		SenderProfilePicture string `json:"senderProfilePicture"`
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close()
	pendingRequestQuery := "SELECT sender AS sender_id, u.username AS sender_username, u.picture_url AS sender_profile_picture " +
		"FROM friends " +
		"JOIN users u on friends.sender = u.uuid " +
		"WHERE reciever=$1 AND status='pending' "
	var contactRequests []singleContactRequest
	err = pgxscan.Select(ctx, conn, &contactRequests, pendingRequestQuery, uuid)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}

	if contactRequests == nil {
		return c.JSON(make([]string, 0))
	}

	return c.JSON(contactRequests)
}

func HandleContactRequest(c *fiber.Ctx) error {
	token, err := authService.GetBearer(c)
	if err != nil {
		return c.Status(401).SendString("NO AUTH")
	}
	uuid, err := userService.GetUUIDBySessionID(token)
	if err != nil {
		return c.Status(401).SendString("NO AUTH")
	}
	type contactRequestResolution struct {
		SenderID string `json:"senderID" validate:"required"`
		Action   string `json:"action" validate:"required"`
	}
	var contactReqResolution contactRequestResolution
	err = c.BodyParser(&contactReqResolution)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(contactReqResolution)
	if err != nil {
		return c.Status(400).SendString("BAD REQUEST")
	}

	var query string
	switch contactReqResolution.Action {
	case "accept":
		query = "UPDATE friends " +
			"SET status = 'accepted' " +
			"WHERE sender = $1 AND  reciever = $2"
	case "decline":
		query = "DELETE FROM friends " +
			"WHERE sender = $1 AND  reciever = $2"
	case "block":
		query = "UPDATE friends " +
			"SET status = 'blocked' " +
			"WHERE sender = $1 AND  reciever = $2"
	default:
		return c.Status(400).SendString("BAD REQUEST")
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	defer conn.Close(ctx)
	_, err = conn.Query(ctx, query, contactReqResolution.SenderID, uuid)
	if err != nil {
		return c.Status(500).SendString("INTERNAL ERROR")
	}
	return c.SendString("SUCCESS")
}
