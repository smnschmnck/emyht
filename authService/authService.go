package authService

import (
	"chat/dbHelpers/postgresHelper"
	"chat/dbHelpers/redisHelper"
	"chat/emailService"
	"chat/userService"
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
	"github.com/labstack/echo/v4"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

type Session struct {
	SessionID string `json:"sessionID"`
	UserID    string `json:"userID"`
}

func GetBearer(c echo.Context) (string, error) {
	bearerArr := strings.Split(c.Request().Header.Get("authorization"), "Bearer ")

	if len(bearerArr) <= 1 {
		return "", errors.New("NOT AUTHORIZED")
	}

	sessionID := bearerArr[1]
	return sessionID, nil
}

type UserRes struct {
	UUID        string `json:"uuid"`
	Email       string `json:"email"`
	Username    string `json:"username"`
	IsAdmin     bool   `json:"isAdmin"`
	EmailActive bool   `json:"emailActive"`
}

func GetUserBySession(c echo.Context) error {
	sessionID, responseErr := GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	user, respErr := userService.GetUserBySessionID(sessionID)
	if respErr.StatusCode >= 300 {
		return c.String(respErr.StatusCode, respErr.Msg)
	}
	res := UserRes{
		UUID:        user.Uuid,
		Email:       user.Email,
		Username:    user.Username,
		IsAdmin:     user.IsAdmin,
		EmailActive: user.EmailActive}
	return c.JSON(http.StatusOK, res)
}

type Credentials struct {
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
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
		return Session{}, err
	}

	rdb := redis.NewClient(&redisHelper.RedisConfig)
	ctx := context.Background()
	err = rdb.Set(ctx, token, uuid, 24*time.Hour).Err()

	if err != nil {
		return Session{}, err
	}
	tmpSession := Session{token, uuid}
	return tmpSession, nil
}

func Register(c echo.Context) error {
	reqUser := new(userService.ReqUser)
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

	lowerCaseEmail := strings.ToLower(reqUser.Email)
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
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG WHILE CREATING YOUR ACCOUNT")
	}

	err = emailService.SendVerificationEmail(reqUser.Username, reqUser.Email, user.EmailToken)

	if err != nil {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG WHILE CREATING YOUR ACCOUNT")
	}

	return c.JSON(http.StatusOK, session)
}

func ResendVerificationEmail(c echo.Context) error {
	sessionID, responseErr := GetBearer(c)
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

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	selectQuery := "SELECT email_active FROM users WHERE email_token=$1"
	rows := conn.QueryRow(ctx, selectQuery, emailToken.Token)
	var dbUserEmailActive bool
	err = rows.Scan(&dbUserEmailActive)
	if err != nil {
		return c.String(http.StatusNotFound, "COULD NOT FIND E-MAIL ADDRESS MATHCHING THE SUPPLIED LINK")
	}

	insertQuery := "UPDATE users SET email_active=true, email_token=$1 WHERE email_token=$2 RETURNING email_active"
	insertedRows := conn.QueryRow(ctx, insertQuery, nil, emailToken.Token)
	var active bool
	err = insertedRows.Scan(&active)
	if err != nil || !active {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG WHILE VERIYFING YOUR E-MAIL")
	}

	return c.String(http.StatusOK, "EMAIL VERIFIED SUCCESSFULLY")
}

func Authenticate(c echo.Context) error {
	credentials := new(Credentials)
	fmt.Println(c)
	err := c.Bind(&credentials)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG")
	}
	err = validate.Struct(credentials)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	lowerCaseEmail := strings.ToLower(credentials.Email)
	user, err := userService.GetUserByEmail(lowerCaseEmail)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	pwCorrect := userService.CheckPW(user, lowerCaseEmail, credentials.Password)
	if !pwCorrect {
		return c.String(http.StatusUnauthorized, "WRONG CREDENTIALS")
	}
	if err != nil {
		fmt.Println(err)
		c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG")
	}
	session, err := startSession(user.Uuid)
	if err != nil {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG WHILE AUTHENTICATING")
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

	sessionID, responseErr := GetBearer(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	user, respErr := userService.GetUserBySessionID(sessionID)
	if respErr.StatusCode >= 300 {
		return c.String(respErr.StatusCode, respErr.Msg)
	}

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	var emailExists bool
	checkQuery := "SELECT count(1) > 0 " +
		"FROM users " +
		"WHERE email=$1"
	rows := conn.QueryRow(ctx, checkQuery, changeReq.NewEmail)
	err = rows.Scan(&emailExists)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	if emailExists {
		return c.String(http.StatusConflict, "EMAIL EXISTS ALREADY")
	}

	insertQuery := "INSERT INTO change_email(uuid, new_email, confirmation_token) " +
		"VALUES ($1, $2, $3) " +
		"ON CONFLICT(uuid) DO UPDATE SET new_email=$2, confirmation_token=$3 " +
		"RETURNING confirmation_token, new_email"
	confirmationToken := uuid.New().String()
	insertedRows := conn.QueryRow(ctx, insertQuery, user.Uuid, changeReq.NewEmail, confirmationToken)
	var dbConfirmationToken string
	var dbNewEmail string
	err = insertedRows.Scan(&dbConfirmationToken, &dbNewEmail)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	err = emailService.SendVerifyEmailChangeEmail(user.Username, dbNewEmail, dbConfirmationToken)

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

	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	defer conn.Close(ctx)
	updateQuery := "UPDATE users u " +
		"SET email_active=true, email_token=$1, email=( " +
		"SELECT c.new_email " +
		"FROM change_email c " +
		"WHERE c.confirmation_token=$2 " +
		") " +
		"WHERE u.uuid=( " +
		"SELECT c.uuid " +
		"FROM change_email c " +
		"WHERE c.confirmation_token=$2 " +
		") " +
		"RETURNING u.email;"
	updatedRows := conn.QueryRow(ctx, updateQuery, nil, confirmToken.Token)
	var dbNewEmail string
	err = updatedRows.Scan(&dbNewEmail)
	if err != nil || dbNewEmail == "" {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	deleteQuery := "DELETE FROM change_email WHERE confirmation_token=$1"
	_, err = conn.Query(ctx, deleteQuery, confirmToken.Token)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	return c.String(http.StatusOK, "SUCCESS")
}

func Logout(c echo.Context) error {
	sessionID, err := GetBearer(c)
	if err != nil {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG")
	}
	rdb := redis.NewClient(&redisHelper.RedisConfig)
	ctx := context.Background()
	_, err = rdb.Del(ctx, sessionID).Result()
	if err != nil {
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG")
	}
	return c.String(http.StatusOK, "SUCCESSFULLY LOGGED OUT")
}
