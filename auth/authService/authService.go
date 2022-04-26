package authService

import (
	"chat/auth/userService"
	"context"
	"crypto/rand"
	"encoding/base64"
	"strings"

	"github.com/go-redis/redis/v8"

	"github.com/go-playground/validator/v10"
	"github.com/gofiber/fiber/v2"
)

var validate = validator.New()
var ctx = context.Background()


type Session struct{
	SessionID string `json:"sessionID"`
	Username string `json:"username"`
}

func GetUserBySession(c *fiber.Ctx) error {
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
	rdb := redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "example",
        DB:       0,
    })
	username, err := rdb.Get(ctx, sessionID).Result()
	if err != nil {
		return UserRes{}, ResponseError{Msg: "USER NOT FOUND", StatusCode: 404}
	}
	user, err := userService.GetUser(username)
	if err != nil {
		return UserRes{}, ResponseError{Msg: "INTERNAL ERROR", StatusCode: 500}
	}

	res := &UserRes{Username: user.Username, FirstName: user.FirstName, LastName: user.LastName, IsAdmin: user.IsAdmin}
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

    rdb := redis.NewClient(&redis.Options{
        Addr:     "localhost:6379",
        Password: "example",
        DB:       0,
    })

    err = rdb.Set(ctx, token, username, 0).Err()

	if err != nil {
		return Session{}, err
	}
	tmpSession := Session{token, username}
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
		return c.Status(500).SendString("SOMETHING WENT WRONG WHILE CREATING YOUR ACCOUNT")
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
	pwCorrect, err := userService.CheckPW(credentials.Username, credentials.Password)
	if err != nil {
		return c.Status(500).SendString("SOMETHING WENT WRONG WHILE AUTHENTICATING")
	}
	if(pwCorrect){
		session, err := startSession(c, credentials.Username)
		if err != nil {
			return c.Status(500).SendString("SOMETHING WENT WRONG WHILE AUTHENTICATING")
		}
		return c.JSON(session)
	}
	return c.Status(401).SendString("WRONG CREDENTIALS")
}