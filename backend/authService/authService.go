package authService

import (
	"chat/db"
	"chat/emailService"
	"chat/queries"
	"chat/redisdb"
	"chat/s3Helpers"
	"chat/userService"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/labstack/echo/v4"

	"github.com/go-playground/validator/v10"
)

const SESSION_DURATION = 24 * time.Hour
const SESSION_COOKIE_NAME = "SESSION"

var validate = validator.New()

type Session struct {
	SessionID string `json:"sessionID"`
	UserID    string `json:"userID"`
}

func getBearer(c echo.Context) (string, error) {
	bearerArr := strings.Split(c.Request().Header.Get("authorization"), "Bearer ")

	if len(bearerArr) <= 1 {
		return "", errors.New("NOT AUTHORIZED")
	}

	sessionID := bearerArr[1]
	return sessionID, nil
}

func getSessionCookieToken(c echo.Context) (string, error) {
	cookie, err := c.Cookie("SESSION")

	if err != nil {
		return "", err
	}

	return cookie.Value, nil
}

func GetSessionToken(c echo.Context) (string, error) {
	cookieToken, err := getSessionCookieToken(c)
	if err != nil {
		return getBearer(c)
	}

	return cookieToken, nil
}

type UserRes struct {
	UUID              string `json:"uuid"`
	Email             string `json:"email"`
	Username          string `json:"username"`
	IsAdmin           bool   `json:"isAdmin"`
	EmailActive       bool   `json:"emailActive"`
	ProfilePictureUrl string `json:"profilePictureUrl"`
}

func GetUserBySession(c echo.Context) error {
	sessionID, responseErr := GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	user, respErr := userService.GetUserBySessionID(sessionID)
	if respErr.StatusCode >= 300 {
		return c.String(respErr.StatusCode, respErr.Msg)
	}

	formattedProfilePic := s3Helpers.FormatPictureUrl(user.ProfilePictureUrl)

	res := UserRes{
		UUID:              user.Uuid,
		Email:             user.Email,
		Username:          user.Username,
		IsAdmin:           user.IsAdmin,
		EmailActive:       user.EmailActive,
		ProfilePictureUrl: formattedProfilePic,
	}
	return c.JSON(http.StatusOK, res)
}

func makeToken() (string, error) {
	bytes := make([]byte, 32)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(bytes), nil
}

func startSession(uuid string) (Session, error) {
	token, err := makeToken()
	if err != nil {
		fmt.Println(err.Error())
		return Session{}, err
	}

	rdb := redisdb.GetSessionsRedisClient()
	err = rdb.Set(redisdb.SessionsCtx, token, uuid, SESSION_DURATION).Err()

	if err != nil {
		fmt.Println(err.Error())
		return Session{}, err
	}
	tmpSession := Session{token, uuid}
	return tmpSession, nil
}

func Register(c echo.Context) error {
	type ReqUser struct {
		Email      string `json:"email" validate:"required"`
		Username   string `json:"username" validate:"required"`
		Password   string `json:"password" validate:"required"`
		AuthMethod string `json:"authMethod"`
	}

	reqUser := new(ReqUser)
	err := c.Bind(reqUser)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(reqUser)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	if len(reqUser.Password) < 8 {
		return c.String(http.StatusForbidden, "PASSWORD TOO SHORT")
	}

	trimmedEmail := strings.TrimSpace(reqUser.Email)
	lowerCaseEmail := strings.ToLower(trimmedEmail)
	user, err := userService.AddUser(lowerCaseEmail, reqUser.Username, reqUser.Password)

	if err != nil {
		errString := err.Error()
		if errString == "USER EXISTS ALREADY" {
			return c.String(http.StatusConflict, errString)
		}
		return c.String(http.StatusInternalServerError, errString)
	}
	session, err := startSession(user.Uuid)

	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG WHILE CREATING YOUR ACCOUNT")
	}

	err = emailService.SendVerificationEmail(reqUser.Username, reqUser.Email, user.EmailToken)

	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG WHILE CREATING YOUR ACCOUNT")
	}

	if reqUser.AuthMethod == "cookie" {
		cookie := createSessionCookie(session.SessionID, time.Now().Add(SESSION_DURATION))
		c.SetCookie(cookie)
		return c.String(http.StatusOK, "SUCCESS")
	}

	return c.JSON(http.StatusOK, session)
}

func ResendVerificationEmail(c echo.Context) error {
	sessionID, responseErr := GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	user, respErr := userService.GetUserBySessionID(sessionID)

	if respErr.StatusCode >= 300 {
		return c.String(respErr.StatusCode, respErr.Msg)
	}
	emailToken, err := userService.RenewEmailToken(user.Email)
	if err != nil {
		return c.String(http.StatusInternalServerError, "ERROR WHILE SENDING EMAIL")
	}
	err = emailService.SendVerificationEmail(user.Username, user.Email, emailToken)
	if err != nil {
		return c.String(http.StatusInternalServerError, "ERROR WHILE SENDING EMAIL")
	}
	return c.String(http.StatusOK, "SUCCESS")
}

func VerifyEmail(c echo.Context) error {
	type EmailToken struct {
		Token string `json:"emailToken" validate:"required"`
	}
	emailToken := new(EmailToken)
	err := c.Bind(emailToken)
	if err != nil {
		c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(emailToken)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	conn := db.GetDB()
	_, err = conn.GetEmailActiveByToken(context.Background(), pgtype.Text{String: emailToken.Token})
	if err != nil {
		return c.String(http.StatusNotFound, "COULD NOT FIND E-MAIL ADDRESS MATCHING THE SUPPLIED LINK")
	}
	active, err := conn.ActivateEmail(context.Background(), queries.ActivateEmailParams{EmailToken: pgtype.Text{String: ""}, EmailToken_2: pgtype.Text{String: emailToken.Token}})
	if err != nil || !active {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG WHILE VERIYFING YOUR E-MAIL")
	}

	return c.String(http.StatusOK, "EMAIL VERIFIED SUCCESSFULLY")
}

func createSessionCookie(value string, expirationDate time.Time) *http.Cookie {
	cookie := new(http.Cookie)
	cookie.Path = "/"
	cookie.Name = SESSION_COOKIE_NAME
	cookie.Value = value
	cookie.Expires = expirationDate
	cookie.SameSite = http.SameSiteLaxMode
	cookie.HttpOnly = true
	cookie.Secure = true

	return cookie
}

func Authenticate(c echo.Context) error {
	type Credentials struct {
		Email      string `json:"email" validate:"required"`
		Password   string `json:"password" validate:"required"`
		AuthMethod string `json:"authMethod"`
	}

	credentials := new(Credentials)
	err := c.Bind(&credentials)
	if err != nil {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG")
	}
	err = validate.Struct(credentials)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	trimmedEmail := strings.TrimSpace(credentials.Email)
	lowerCaseEmail := strings.ToLower(trimmedEmail)
	user, err := userService.GetUserByEmail(lowerCaseEmail)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	pwCorrect := userService.CheckPW(user, lowerCaseEmail, credentials.Password)
	if !pwCorrect {
		return c.String(http.StatusUnauthorized, "WRONG CREDENTIALS")
	}
	session, err := startSession(user.Uuid)
	if err != nil {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG WHILE AUTHENTICATING")
	}

	if credentials.AuthMethod == "cookie" {
		cookie := createSessionCookie(session.SessionID, time.Now().Add(SESSION_DURATION))
		c.SetCookie(cookie)
		return c.String(http.StatusOK, "SUCCESS")
	}

	return c.JSON(http.StatusOK, session)
}

func ChangeEmail(c echo.Context) error {
	type ChangeReq struct {
		NewEmail string `json:"newEmail" validate:"required"`
	}
	changeReq := new(ChangeReq)
	err := c.Bind(&changeReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(changeReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	sessionID, responseErr := GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	user, respErr := userService.GetUserBySessionID(sessionID)
	if respErr.StatusCode >= 300 {
		return c.String(respErr.StatusCode, respErr.Msg)
	}

	conn := db.GetDB()

	trimmedEmail := strings.TrimSpace(changeReq.NewEmail)
	lowerCaseEmail := strings.ToLower(trimmedEmail)
	emailExists, err := conn.EmailExists(context.Background(), lowerCaseEmail)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	if emailExists {
		return c.String(http.StatusConflict, "EMAIL EXISTS ALREADY")
	}

	confirmationToken := uuid.New().String()
	rows, err := conn.UpsertChangeEmail(context.Background(), queries.UpsertChangeEmailParams{Uuid: user.Uuid, NewEmail: lowerCaseEmail, ConfirmationToken: confirmationToken})
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	err = emailService.SendVerifyEmailChangeEmail(user.Username, rows.NewEmail, rows.ConfirmationToken)

	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	return c.String(http.StatusOK, "SUCCESS")
}

func ConfirmChangedEmail(c echo.Context) error {
	type ConfirmToken struct {
		Token string `json:"confirmToken" validate:"required"`
	}
	confirmToken := new(ConfirmToken)
	err := c.Bind(&confirmToken)
	if err != nil {
		c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(confirmToken)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	conn := db.GetDB()
	dbNewEmail, err := conn.UpdateEmailFromChangeEmail(context.Background(), queries.UpdateEmailFromChangeEmailParams{EmailToken: pgtype.Text{String: ""}, ConfirmationToken: confirmToken.Token})
	if err != nil || dbNewEmail == "" {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	err = conn.DeleteChangeEmail(context.Background(), confirmToken.Token)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	return c.String(http.StatusOK, "SUCCESS")
}

func ChangeUsername(c echo.Context) error {
	sessionID, responseErr := GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type ChangeReq struct {
		NewUsername string `json:"newUsername" validate:"required"`
	}
	changeReq := new(ChangeReq)
	err = c.Bind(&changeReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(changeReq)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	conn := db.GetDB()
	_, err = conn.UpdateUsername(context.Background(), queries.UpdateUsernameParams{Username: changeReq.NewUsername, Uuid: reqUUID})
	if err != nil {
		return c.String(http.StatusInternalServerError, "COULD NOT CHANGE USERNAME")
	}

	return c.String(http.StatusOK, "SUCCESS")
}

func Logout(c echo.Context) error {
	sessionID, err := GetSessionToken(c)
	if err != nil {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG")
	}
	rdb := redisdb.GetSessionsRedisClient()
	_, err = rdb.Del(redisdb.SessionsCtx, sessionID).Result()
	if err != nil {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG")
	}

	_, err = c.Cookie(SESSION_COOKIE_NAME)
	if err != nil {
		return c.String(http.StatusOK, "SUCCESSFULLY LOGGED OUT")
	}
	cookie := createSessionCookie("", time.Unix(0, 0))
	c.SetCookie(cookie)

	return c.String(http.StatusOK, "SUCCESSFULLY LOGGED OUT")
}
