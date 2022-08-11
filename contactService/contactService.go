package contactService

import (
	"chat/authService"
	"chat/dbHelpers/postgresHelper"
	"chat/userService"
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
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

type contact struct {
	Username   string `json:"name"`
	Uuid       string `json:"id"`
	PictureUrl string `json:"profilePictureUrl"`
}

func GetUserContactsbyUUID(uuid string) ([]contact, error) {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return []contact{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	query := "SELECT u.username, u.uuid, u.picture_url " +
		"FROM friends " +
		"JOIN users u ON u.uuid = friends.sender OR friends.reciever = u.uuid " +
		"WHERE (reciever=$1 OR sender=$1) AND status='accepted' AND u.uuid != $1"
	var contacts []contact
	err = pgxscan.Select(ctx, conn, &contacts, query, uuid)
	if err != nil {
		fmt.Println(err)
		return []contact{}, errors.New("INTERNAL ERROR")
	}

	if contacts == nil {
		return make([]contact, 0), nil
	}
	return contacts, nil
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

	contacts, err := GetUserContactsbyUUID(uuid)

	if err != nil {
		return c.Status(500).SendString(err.Error())
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
