package contactService

import (
	"chat/authService"
	"chat/db"
	"chat/pusher"
	"chat/queries"
	"chat/s3Helpers"
	"chat/userService"
	"context"
	"errors"
	"log"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx/v5/pgtype"
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

	duplicateExists, err := conn.CheckDuplicateFriendRequest(context.TODO(), queries.CheckDuplicateFriendRequestParams{ReceiverID: user.ID, Email: lowerCaseEmail})
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	if duplicateExists {
		return c.String(http.StatusConflict, lowerCaseEmail+" ALREADY SENT A FRIEND REQUEST TO YOU")
	}

	_, err = conn.CreateFriendRequest(context.Background(), queries.CreateFriendRequestParams{SenderID: user.ID, Email: lowerCaseEmail})
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
	uuid := user.ID.String()

	pusher.PusherClient.Trigger(pusher.USER_FEED_PREFIX+uuid, pusher.CONTACT_REQUEST_EVENT, nil)

	return nil
}

func GetUserContactsbyUUID(uuid pgtype.UUID) ([]queries.GetUserContactsRow, error) {
	conn := db.GetDB()

	contacts, err := conn.GetUserContacts(context.Background(), uuid)
	if err != nil {
		log.Println(err)
		return []queries.GetUserContactsRow{}, errors.New("INTERNAL ERROR")
	}

	if contacts == nil {
		return make([]queries.GetUserContactsRow, 0), nil
	}
	return contacts, nil
}

func IsBlockedByUsers(userIds []string, uuid pgtype.UUID) (bool, error) {
	conn := db.GetDB()
	blockers, err := conn.GetUsersWhoBlockedUser(context.Background(), uuid)
	if err != nil {
		log.Println(err.Error())
		return true, err
	}

	for _, uuidToRemove := range userIds {
		isBlocked := false
		for _, blocker := range blockers {
			if uuidToRemove == blocker.String() {
				isBlocked = true
				break
			}
		}
		if isBlocked {
			return true, nil
		}
	}

	return false, nil
}

func AreUsersBlocked(userIds []string, uuid pgtype.UUID) (bool, error) {
	conn := db.GetDB()
	blockedUsers, err := conn.GetBlockedUsers(context.Background(), uuid)
	if err != nil {
		log.Println(err.Error())
		return true, err
	}

	for _, uuidToRemove := range userIds {
		isBlocked := false
		for _, blockedUser := range blockedUsers {
			if uuidToRemove == blockedUser.String() {
				isBlocked = true
				break
			}
		}
		if isBlocked {
			return true, nil
		}
	}

	return false, nil
}

func AreUsersInContacts(usersUUIDs []string, uuid pgtype.UUID) (bool, error) {
	contacts, err := GetUserContactsbyUUID(uuid)
	if err != nil {
		return false, err
	}

	for _, userUUID := range usersUUIDs {
		inContacts := false
		for _, contact := range contacts {
			if contact.ID.String() == userUUID {
				inContacts = true
				break
			}
		}
		if !inContacts {
			return false, nil
		}
	}

	isBlocked, err := IsBlockedByUsers(usersUUIDs, uuid)
	if err != nil {
		return false, err
	}
	if isBlocked {
		return false, nil
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

func GetPendingContactRequestsByUUID(uuid pgtype.UUID) ([]queries.GetPendingFriendRequestsRow, error) {
	conn := db.GetDB()
	contactRequests, err := conn.GetPendingFriendRequests(context.Background(), uuid)
	if err != nil {
		log.Println(err.Error())
		return make([]queries.GetPendingFriendRequestsRow, 0), errors.New("INTERNAL ERROR")
	}

	if contactRequests == nil {
		return make([]queries.GetPendingFriendRequestsRow, 0), nil
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
		log.Println(err.Error())
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

	conn := db.GetDB()
	ctx := context.Background()
	var senderUUID pgtype.UUID
	err = senderUUID.Scan(contactReqResolution.SenderID)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	switch contactReqResolution.Action {
	case "accept":
		err = conn.AcceptFriendRequest(ctx, queries.AcceptFriendRequestParams{
			SenderID:   senderUUID,
			ReceiverID: uuid,
		})
		if err != nil {
			log.Println("Error accepting friend request:", err)
			return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
		}
	case "decline":
		err = conn.DeclineFriendRequest(ctx, queries.DeclineFriendRequestParams{
			SenderID:   senderUUID,
			ReceiverID: uuid,
		})
		if err != nil {
			log.Println("Error declining friend request:", err)
			return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
		}
	default:
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	return c.String(http.StatusOK, "SUCCESS")
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

	var userIdToBlock pgtype.UUID
	err = userIdToBlock.Scan(blockUserReq.UserID)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	conn := db.GetDB()
	err = conn.BlockUser(context.Background(), queries.BlockUserParams{BlockedID: userIdToBlock, BlockerID: uuid})
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	return c.String(http.StatusOK, "SUCCESS")
}

func UnblockUser(c echo.Context) error {
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

	var userIdToUnblock pgtype.UUID
	err = userIdToUnblock.Scan(blockUserReq.UserID)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	conn := db.GetDB()
	err = conn.UnblockUser(context.Background(), queries.UnblockUserParams{BlockedID: userIdToUnblock, BlockerID: uuid})
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
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

	contactRequests, err := conn.GetSentContactRequests(context.Background(), uuid)
	if err != nil {
		log.Println(err.Error())
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if contactRequests == nil {
		return c.JSON(http.StatusOK, make([]queries.GetPendingFriendRequestsRow, 0))
	}

	return c.JSON(http.StatusOK, contactRequests)
}
