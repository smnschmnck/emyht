package contactService

import (
	"chat/authService"
	"chat/dbHelpers/postgresHelper"
	"chat/s3Helpers"
	"chat/userService"
	"chat/wsService"
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v4"
	"github.com/jackc/pgx/v4/pgxpool"
	"github.com/labstack/echo/v4"
)

var validate = validator.New()

func SendContactRequest(c echo.Context) error {
	token, err := authService.GetBearer(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}
	type contactRequest struct {
		ContactEmail string `json:"contactEmail" validate:"required"`
	}
	contactReq := new(contactRequest)
	err = c.Bind(contactReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(contactReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	user, respErr := userService.GetUserBySessionID(token)
	if respErr.StatusCode >= 300 {
		return c.String(respErr.StatusCode, respErr.Msg)
	}

	trimmedEmail := strings.TrimSpace(contactReq.ContactEmail)
	lowerCaseEmail := strings.ToLower(trimmedEmail)
	if user.Email == lowerCaseEmail {
		return c.String(http.StatusInternalServerError, "YOU CAN'T SEND A CONTACT REQUEST TO YOURSELF")
	}

	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close()

	checkDuplicateQuery := "SELECT EXISTS( " +
		"SELECT 1 " +
		"FROM friends " +
		"WHERE reciever = $1 AND sender = (SELECT uuid FROM users WHERE email=$2) " +
		") "
	checkDuplicateRows := conn.QueryRow(ctx, checkDuplicateQuery, user.Uuid, lowerCaseEmail)
	var duplicateExists bool
	err = checkDuplicateRows.Scan(&duplicateExists)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	if duplicateExists {
		return c.String(http.StatusConflict, lowerCaseEmail+" ALREADY SENT A FRIEND REQUEST TO YOU")
	}

	contactReqQuery := "INSERT INTO friends(sender, reciever, status) " +
		"VALUES ($1, (SELECT uuid FROM users WHERE email=$2), 'pending') " +
		"RETURNING status"
	contactReqRows := conn.QueryRow(ctx, contactReqQuery, user.Uuid, lowerCaseEmail)
	var status string
	err = contactReqRows.Scan(&status)
	if err != nil {
		if strings.Contains(err.Error(), "violates not-null constraint") {
			return c.String(http.StatusNotFound, "USER DOES NOT EXIST")
		}
		if strings.Contains(err.Error(), "duplicate key value violates unique constraint") {
			return c.String(http.StatusConflict, "DUPLICATE CONTACT REQUEST")
		}
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	sendNewContactReqNotification(lowerCaseEmail)

	return c.String(http.StatusOK, "SUCCESS")
}

func sendNewContactReqNotification(email string) error {
	user, err := userService.GetUserByEmail(email)
	if err != nil {
		return err
	}
	uuid := user.Uuid

	return wsService.WriteEventToSingleUUID(uuid, "contactRequest")
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

func GetContacts(c echo.Context) error {
	token, err := authService.GetBearer(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}
	uuid, err := userService.GetUUIDBySessionID(token)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}

	contacts, err := GetUserContactsbyUUID(uuid)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	for i, contact := range contacts {
		picUrl := contact.PictureUrl
		if strings.HasPrefix(picUrl, "storage.emyht.com/") {
			trimmedPicUrl := strings.Replace(picUrl, "storage.emyht.com/", "", -1)
			presignedUrl, err := s3Helpers.PresignGetObject(trimmedPicUrl)
			if err == nil {
				contacts[i].PictureUrl = presignedUrl
			}
		}
	}

	return c.JSON(http.StatusOK, contacts)
}

type singleContactRequest struct {
	SenderID             string `json:"senderID"`
	SenderUsername       string `json:"senderUsername"`
	SenderProfilePicture string `json:"senderProfilePicture"`
}

func GetPendingContactRequestsByUUID(uuid string) ([]singleContactRequest, error) {
	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return make([]singleContactRequest, 0), errors.New("INTERNAL ERROR")
	}
	defer conn.Close()
	pendingRequestQuery := "SELECT sender AS sender_id, u.username AS sender_username, u.picture_url AS sender_profile_picture " +
		"FROM friends " +
		"JOIN users u on friends.sender = u.uuid " +
		"WHERE reciever=$1 AND status='pending' "
	var contactRequests []singleContactRequest
	err = pgxscan.Select(ctx, conn, &contactRequests, pendingRequestQuery, uuid)
	if err != nil {
		return make([]singleContactRequest, 0), errors.New("INTERNAL ERROR")
	}

	if contactRequests == nil {
		return make([]singleContactRequest, 0), nil
	}

	return contactRequests, nil
}

func GetPendingContactRequests(c echo.Context) error {
	sessionID, responseErr := authService.GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}
	uuid, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	contactRequests, err := GetPendingContactRequestsByUUID(uuid)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, contactRequests)
}

func HandleContactRequest(c echo.Context) error {
	token, err := authService.GetBearer(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}
	uuid, err := userService.GetUUIDBySessionID(token)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}
	type contactRequestResolution struct {
		SenderID string `json:"senderID" validate:"required"`
		Action   string `json:"action" validate:"required"`
	}
	contactReqResolution := new(contactRequestResolution)
	err = c.Bind(contactReqResolution)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(contactReqResolution)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
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
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close(ctx)
	_, err = conn.Query(ctx, query, contactReqResolution.SenderID, uuid)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	return c.String(http.StatusOK, "SUCCESS")
}
