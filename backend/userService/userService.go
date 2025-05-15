package userService

import (
	"chat/db"
	"chat/queries"
	"chat/redisdb"
	"context"
	"crypto/sha512"
	"encoding/hex"
	"errors"
	"log"
	"math/rand"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func getPepper() string {
	pepper := os.Getenv("PEPPER")
	if pepper == "" {
		panic("NO PEPPER")
	}
	return pepper
}

func GetUserByUUID(uuid pgtype.UUID) (queries.GetUserByUUIDRow, error) {
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

func GetUUIDBySessionID(sessionID string) (pgtype.UUID, error) {
	rdb := redisdb.GetSessionsRedisClient()
	uuid, err := rdb.Get(redisdb.SessionsCtx, sessionID).Result()
	if err != nil {
		return pgtype.UUID{}, err
	}
	rdb.Set(redisdb.SessionsCtx, sessionID, uuid, 24*time.Hour)

	var pgUUID pgtype.UUID
	err = pgUUID.Scan(uuid)
	if err != nil {
		return pgtype.UUID{}, err
	}

	return pgUUID, nil
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

func AddUser(email string, username string, password string) (queries.CreateUserRow, error) {
	salt, err := makeSalt()
	if err != nil {
		return queries.CreateUserRow{}, errors.New("UNEXPECTED ERROR")
	}

	pepper := getPepper()
	emailToken := uuid.New().String()
	hashedPW := hashPW(password, salt, pepper)
	randPictureInt := rand.Intn(10)
	defaultPicture := "default_" + strconv.Itoa(randPictureInt)
	conn := db.GetDB()
	user, err := conn.CreateUser(context.Background(), queries.CreateUserParams{
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
			return queries.CreateUserRow{}, errors.New("USER EXISTS ALREADY")
		}
		log.Println(err.Error())
		return queries.CreateUserRow{}, errors.New("INTERNAL ERROR")
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

func ChangeProfilePicture(uuid pgtype.UUID, newPicture string) error {
	conn := db.GetDB()

	err := conn.UpdatePictureURL(context.Background(), queries.UpdatePictureURLParams{PictureUrl: newPicture, ID: uuid})
	if err != nil {
		return err
	}

	return nil
}
