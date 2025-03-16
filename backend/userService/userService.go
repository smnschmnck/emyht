package userService

import (
	"chat/db"
	"chat/queries"
	"chat/redisdb"
	"context"
	"crypto/sha512"
	"encoding/hex"
	"errors"
	"fmt"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
)

type User struct {
	Uuid              string `json:"uuid"`
	Email             string `json:"email"`
	Username          string `json:"username"`
	Password          string `json:"password"`
	Salt              string `json:"salt"`
	IsAdmin           bool   `json:"isAdmin"`
	EmailActive       bool   `json:"emailActive"`
	EmailToken        string `json:"emailToken"`
	ProfilePictureUrl string `json:"profilePictureUrl"`
}

func getPepper() string {
	pepper := os.Getenv("PEPPER")
	if pepper == "" {
		panic("NO PEPPER")
	}
	return pepper
}

func GetUserByUUID(uuid string) (queries.GetUserByUUIDRow, error) {
	conn := db.GetDB()

	user, err := conn.GetUserByUUID(context.Background(), uuid)
	if err != nil {
		return queries.GetUserByUUIDRow{}, errors.New("USER NOT FOUND")
	}

	return user, nil
}

func GetUserByEmail(email string) (queries.GetUserByEmailRow, error) {
	conn := db.GetDB()

	user, err := conn.GetUserByEmail(context.Background(), email)
	if err != nil {
		return queries.GetUserByEmailRow{}, errors.New("USER NOT FOUND")
	}

	return user, nil
}

type ResponseError struct {
	Msg        string
	StatusCode int
}

func GetUUIDBySessionID(sessionID string) (string, error) {
	rdb := redisdb.GetSessionsRedisClient()
	uuid, err := rdb.Get(redisdb.SessionsCtx, sessionID).Result()
	if err != nil {
		return "", err
	}
	rdb.Set(redisdb.SessionsCtx, sessionID, uuid, 24*time.Hour)
	return uuid, nil
}

func GetUserBySessionID(sessionID string) (queries.GetUserByUUIDRow, ResponseError) {
	uuid, err := GetUUIDBySessionID(sessionID)
	if err != nil {
		return queries.GetUserByUUIDRow{}, ResponseError{Msg: "USER NOT FOUND", StatusCode: 404}
	}
	user, err := GetUserByUUID(uuid)
	if err != nil {
		return queries.GetUserByUUIDRow{}, ResponseError{Msg: "INTERNAL ERROR", StatusCode: 500}
	}

	return user, ResponseError{StatusCode: 200}
}

func hashPW(password string, salt string, pepper string) string {
	h := sha512.New()
	h.Write([]byte(password + salt + pepper))
	sum := h.Sum(nil)
	return hex.EncodeToString(sum)
}

func makeSalt() (string, error) {
	bytes := make([]byte, 16)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func AddUser(email string, username string, password string) (queries.User, error) {
	salt, err := makeSalt()
	if err != nil {
		return queries.User{}, errors.New("UNEXPECTED ERROR")
	}

	pepper := getPepper()
	emailToken := uuid.New().String()
	hashedPW := hashPW(password, salt, pepper)
	userID := uuid.New().String()
	randPictureInt := rand.Intn(10)
	defaultPicture := "default_" + strconv.Itoa(randPictureInt)
	conn := db.GetDB()
	user, err := conn.CreateUser(context.Background(), queries.CreateUserParams{
		Uuid:        userID,
		Email:       email,
		Username:    username,
		Password:    hashedPW,
		Salt:        salt,
		IsAdmin:     false,
		EmailActive: false,
		EmailToken:  &emailToken,
		PictureUrl:  defaultPicture,
	})

	if err != nil {
		errString := err.Error()
		if strings.Contains(errString, `duplicate key value violates unique constraint`) {
			return queries.User{}, errors.New("USER EXISTS ALREADY")
		}
		fmt.Println(err.Error())
		return queries.User{}, errors.New("INTERNAL ERROR")
	}

	return user, nil
}

func RenewEmailToken(email string) (*string, error) {
	conn := db.GetDB()

	emailToken := uuid.New().String()

	dbEmailToken, err := conn.UpdateEmailToken(context.Background(), queries.UpdateEmailTokenParams{
		EmailToken: &emailToken,
		Email:      email,
	})
	if err != nil {
		return nil, err
	}
	return dbEmailToken, nil
}

func CheckPW(password string, actualPw string, salt string) bool {
	pepper := getPepper()
	hashedPW := hashPW(password, salt, pepper)
	return hashedPW == actualPw
}

func ChangeProfilePicture(uuid string, newPicture string) error {
	conn := db.GetDB()

	err := conn.UpdatePictureURL(context.Background(), queries.UpdatePictureURLParams{PictureUrl: newPicture, Uuid: uuid})
	if err != nil {
		return err
	}

	return nil
}
