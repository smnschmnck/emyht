package authService

import (
	"chat/auth/userService"
	"chat/dbHelpers/postgresHelper"
	"crypto/rand"
	"encoding/base64"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx"
)

var validate = validator.New()

type Session struct{
	SessionID string `json:"sessionID"`
	Username string `json:"username"`
}

func GetUser(c *fiber.Ctx) error {
	bearerArr := strings.Split(c.Get("authorization"), "Bearer ")

	if(len(bearerArr) <= 1){
		return c.Status(401).SendString("NOT AUTHORIZED")
	}

	sessionID := bearerArr[1]

	user, err := getUserBySessionID(sessionID)

	if err.StatusCode >= 300 {
		return c.Status(err.StatusCode).SendString(err.Msg)
	}

	return c.JSON(user)
}

type UserRes struct{
	Username string `json:"username"`
	FirstName string `json:"firstName"`
	LastName string `json:"lastName"`
	IsAdmin bool `json:"isAdmin"`
}

type ResponseError struct {
    Msg    string
    StatusCode int
}

func getUserBySessionID(sessionID string) (UserRes, ResponseError){
	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return UserRes{}, ResponseError{Msg: "INTERNAL ERROR", StatusCode: 500}
	}
	defer conn.Close()
	q := `SELECT u.username, u.first_name, u.last_name, u.is_admin
	FROM sessions
	RIGHT JOIN users u
	ON u.username = sessions.username
	WHERE session_id = $1`
	rows := conn.QueryRow(q, sessionID)
	var dbUsername string
	var dbFirstName string
	var dbLastName string
	var dbUserIsAdmin bool
	err = rows.Scan(&dbUsername, &dbFirstName, &dbLastName, &dbUserIsAdmin)
	if err != nil {
		return UserRes{}, ResponseError{Msg: "USER NOT FOUND", StatusCode: 404}
	}

	res := &UserRes{Username: dbUsername, FirstName: dbFirstName, LastName: dbLastName, IsAdmin: dbUserIsAdmin}
	return *res, ResponseError{StatusCode: 200}
}

type Credentials struct{
	Username string `json:"username"`
	Password string `json:"password"`
}

func makeToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(bytes), nil
}

func startSession(c *fiber.Ctx, username string) (Session, error){
	token, err := makeToken(32);
	if(err != nil){
		c.Status(500).SendString("SOMETHING WENT WRONG")
		return Session{}, err
	}

	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return Session{}, err
	}
	defer conn.Close()
	
	var dbUserToken string
	var dbUsername string

	q := "INSERT INTO sessions VALUES ($1, $2) RETURNING *;"
	rows := conn.QueryRow(q, token, username)
	err = rows.Scan(&dbUserToken, &dbUsername)
	if err != nil {
		return Session{}, err
	}
	tmpSession := Session{dbUserToken, dbUsername}
	return tmpSession, nil;
}

func Register(c *fiber.Ctx) error {
	var reqUser userService.ReqUser
	err := c.BodyParser(&reqUser)
	if(err != nil){
		return c.Status(400).SendString("BAD REQUEST")
	}
	err = validate.Struct(reqUser);
	if(err != nil){
		return c.Status(400).SendString("BAD REQUEST")
	}
	_, err = userService.AddUser(reqUser.Username, reqUser.FirstName, reqUser.LastName, reqUser.Password)

	if(err != nil){
		errString := err.Error()
		if(errString == "USER EXISTS ALREADY"){
			return c.Status(409).SendString(errString)
		}
		c.Status(500).SendString(errString)
	}

	session, err := startSession(c, reqUser.Username)

	if err != nil {
		return c.Status(500).SendString("Something went wrong while creating your Account")
	}

	return c.JSON(session)
}

func Authenticate(c *fiber.Ctx) error{
	var credentials Credentials
	err := c.BodyParser(&credentials)
	if(err != nil){
		return c.Status(500).SendString("SOMETHING WENT WRONG")
	}
	err = validate.Struct(credentials);
	if(err != nil){
		return c.Status(400).SendString("BAD REQUEST")
	}
	pwCorrect := userService.CheckPW(credentials.Username, credentials.Password)
	if(pwCorrect){
		session, err := startSession(c, credentials.Username)
		if err != nil {
			return c.Status(500).SendString("Something went wrong while authenticating")
		}
		return c.JSON(session)
	}
	return c.Status(401).SendString("WRONG CREDENTIALS")
}