package contactService

import (
	"chat/authService"
	"chat/db"
	"chat/pusher"
	"chat/s3Helpers"
	"chat/userService"
	"context"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/georgysavva/scany/v2/pgxscan"
	"github.com/go-playground/validator/v10"
	"github.com/labstack/echo/v4"
)

var validate = validator.New()

func SendContactRequest(c echo.Context) error {
	token, err := authService.GetSessionToken(c)
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

	conn := db.GetDB()

	checkDuplicateQuery := "SELECT EXISTS( " +
		"SELECT 1 " +
		"FROM friends " +
		"WHERE reciever = $1 AND sender = (SELECT uuid FROM users WHERE email=$2) " +
		") "
	checkDuplicateRows := conn.QueryRow(context.Background(), checkDuplicateQuery, user.Uuid, lowerCaseEmail)
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
	contactReqRows := conn.QueryRow(context.Background(), contactReqQuery, user.Uuid, lowerCaseEmail)
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

	pusher.PusherClient.Trigger(pusher.USER_FEED_PREFIX+uuid, pusher.CONTACT_REQUEST_EVENT, nil)

	return nil
}

type Contact struct {
	Username   string `json:"name"`
	Uuid       string `json:"id"`
	PictureUrl string `json:"profilePictureUrl"`
}

func GetUserContactsbyUUID(uuid string) ([]Contact, error) {
	conn := db.GetDB()

	query := "SELECT u.username, u.uuid, u.picture_url " +
		"FROM friends " +
		"JOIN users u ON u.uuid = friends.sender OR friends.reciever = u.uuid " +
		"WHERE (reciever=$1 OR sender=$1) AND status='accepted' AND u.uuid != $1"
	var contacts []Contact
	err := pgxscan.Select(context.Background(), conn, &contacts, query, uuid)
	if err != nil {
		fmt.Println(err)
		return []Contact{}, errors.New("INTERNAL ERROR")
	}

	if contacts == nil {
		return make([]Contact, 0), nil
	}
	return contacts, nil
}

func AreUsersInContacts(usersUUIDs []string, uuid string) (bool, error) {
	contacts, err := GetUserContactsbyUUID(uuid)
	if err != nil {
		return false, err
	}

	for _, userUUID := range usersUUIDs {
		inContacts := false
		for _, contact := range contacts {
			if contact.Uuid == userUUID {
				inContacts = true
				break
			}
		}
		if !inContacts {
			return false, nil
		}
	}

	return true, nil
}

func GetContacts(c echo.Context) error {
	token, err := authService.GetSessionToken(c)
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
		contacts[i].PictureUrl = s3Helpers.FormatPictureUrl(contact.PictureUrl)
	}

	return c.JSON(http.StatusOK, contacts)
}

type singleContactRequest struct {
	SenderID             string `json:"senderID"`
	SenderUsername       string `json:"senderUsername"`
	SenderProfilePicture string `json:"senderProfilePicture"`
	SenderEmail          string `json:"senderEmail"`
}

func GetPendingContactRequestsByUUID(uuid string) ([]singleContactRequest, error) {
	conn := db.GetDB()
	pendingRequestQuery := "SELECT sender AS sender_id, u.username AS sender_username, u.picture_url AS sender_profile_picture, u.email AS sender_email " +
		"FROM friends " +
		"JOIN users u on friends.sender = u.uuid " +
		"WHERE reciever=$1 AND status='pending' "
	var contactRequests []singleContactRequest
	err := pgxscan.Select(context.Background(), conn, &contactRequests, pendingRequestQuery, uuid)
	if err != nil {
		return make([]singleContactRequest, 0), errors.New("INTERNAL ERROR")
	}

	if contactRequests == nil {
		return make([]singleContactRequest, 0), nil
	}

	return contactRequests, nil
}

func GetPendingContactRequests(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
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
	token, err := authService.GetSessionToken(c)
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

	conn := db.GetDB()
	_, err = conn.Query(context.Background(), query, contactReqResolution.SenderID, uuid)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	return c.String(http.StatusOK, "SUCCESS")
}

func blockUser(uuidToBeBlocked string, uuid string, chatID string) error {
	conn := db.GetDB()

	//check if user is in contacts
	uuidToBeBlockedAsArray := []string{uuidToBeBlocked}
	inContacts, err := AreUsersInContacts(uuidToBeBlockedAsArray, uuid)
	if err != nil {
		return errors.New("INTERNAL ERROR")
	}
	if !inContacts {
		return errors.New("USER NOT IN CONTACTS")
	}

	var dbStatus string
	query := "UPDATE friends " +
		"SET status = 'blocked' " +
		"WHERE (sender = $1 AND reciever = $2) OR (sender = $2 AND reciever = $1) " +
		"RETURNING status"
	err = conn.QueryRow(context.Background(), query, uuidToBeBlocked, uuid).Scan(&dbStatus)
	if err != nil {
		fmt.Println(err)
		return errors.New("INTERNAL ERROR")
	}

	var chatStatus bool
	query = "UPDATE chats " +
		"SET blocked = true " +
		"WHERE chat_id = $1 " +
		"RETURNING blocked"
	err = conn.QueryRow(context.Background(), query, chatID).Scan(&chatStatus)
	if err != nil {
		fmt.Println(err)
		return errors.New("INTERNAL ERROR")
	}

	pusher.PusherClient.Trigger(pusher.USER_FEED_PREFIX+uuidToBeBlocked, pusher.CHAT_EVENT, nil)

	return nil
}

func BlockUser(c echo.Context) error {
	token, err := authService.GetSessionToken(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}
	uuid, err := userService.GetUUIDBySessionID(token)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}

	type blockUserRequest struct {
		UserID string `json:"userID" validate:"required"`
		ChatID string `json:"chatID" validate:"required"`
	}
	blockUserReq := new(blockUserRequest)
	err = c.Bind(blockUserReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(blockUserReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	err = blockUser(blockUserReq.UserID, uuid, blockUserReq.ChatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.String(http.StatusOK, "SUCCESS")
}

func GetSentContactRequests(c echo.Context) error {
	token, err := authService.GetSessionToken(c)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}
	uuid, err := userService.GetUUIDBySessionID(token)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NO AUTH")
	}

	conn := db.GetDB()

	type contactRequest struct {
		Email string `json:"email"`
		Date  string `json:"date"`
	}

	query := "SELECT u.email as email, TO_CHAR(created_at, 'DD.MM.YYYY') as date FROM friends " +
		"JOIN users u on u.uuid = friends.reciever " +
		"WHERE sender = $1 AND status='pending'"
	var contactRequests []contactRequest
	err = pgxscan.Select(context.Background(), conn, &contactRequests, query, uuid)
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if contactRequests == nil {
		return c.JSON(http.StatusOK, make([]singleContactRequest, 0))
	}

	return c.JSON(http.StatusOK, contactRequests)
}
