package userService

import (
	"chat/dbHelpers/postgresHelper"
	"chat/dbHelpers/redisHelper"
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

	"github.com/go-redis/redis/v8"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v4"
)

type ReqUser struct {
	Email    string `json:"email" validate:"required"`
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type User struct {
	Uuid        string `json:"uuid"`
	Email       string `json:"email"`
	Username    string `json:"username"`
	Password    string `json:"password"`
	Salt        string `json:"salt"`
	IsAdmin     bool   `json:"isAdmin"`
	EmailActive bool   `json:"emailActive"`
	EmailToken  string `json:"emailToken"`
}

func getPepper() string {
	pepper := os.Getenv("PEPPER")
	if pepper == "" {
		panic("NO PEPPER")
	}
	return pepper
}

func GetUserByUUID(uuid string) (User, error) {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return User{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	var dbUUID string
	var dbEmail string
	var dbUsername string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool
	var dbUserEmailActive bool

	q := "select uuid, email, username, password, salt, is_admin, email_active from users where uuid=$1"
	rows := conn.QueryRow(ctx, q, uuid)
	err = rows.Scan(
		&dbUUID,
		&dbEmail,
		&dbUsername,
		&dbUserPassword,
		&dbUserSalt,
		&dbUserIsAdmin,
		&dbUserEmailActive)
	if err != nil {
		return User{}, errors.New("USER NOT FOUND")
	}

	return User{
		Uuid:        dbUUID,
		Email:       dbEmail,
		Username:    dbUsername,
		Password:    dbUserPassword,
		Salt:        dbUserSalt,
		IsAdmin:     dbUserIsAdmin,
		EmailActive: dbUserEmailActive,
	}, nil
}

func GetUserByEmail(email string) (User, error) {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return User{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close(ctx)

	var dbUUID string
	var dbEmail string
	var dbUsername string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool
	var dbUserEmailActive bool

	q := "select uuid, email, username, password, salt, is_admin, email_active from users where email=$1"
	rows := conn.QueryRow(ctx, q, email)
	err = rows.Scan(
		&dbUUID,
		&dbEmail,
		&dbUsername,
		&dbUserPassword,
		&dbUserSalt,
		&dbUserIsAdmin,
		&dbUserEmailActive)
	if err != nil {
		return User{}, errors.New("USER NOT FOUND")
	}

	return User{
		Uuid:        dbUUID,
		Email:       dbEmail,
		Username:    dbUsername,
		Password:    dbUserPassword,
		Salt:        dbUserSalt,
		IsAdmin:     dbUserIsAdmin,
		EmailActive: dbUserEmailActive,
	}, nil
}

type ResponseError struct {
	Msg        string
	StatusCode int
}

func GetUUIDBySessionID(sessionID string) (string, error) {
	ctx := context.Background()
	rdb := redis.NewClient(&redisHelper.RedisConfig)
	uuid, err := rdb.Get(ctx, sessionID).Result()
	if err != nil {
		return "", err
	}
	rdb.Set(ctx, sessionID, uuid, 24*time.Hour)
	return uuid, nil
}

func GetUserBySessionID(sessionID string) (User, ResponseError) {
	uuid, err := GetUUIDBySessionID(sessionID)
	if err != nil {
		return User{}, ResponseError{Msg: "USER NOT FOUND", StatusCode: 404}
	}
	user, err := GetUserByUUID(uuid)
	if err != nil {
		return User{}, ResponseError{Msg: "INTERNAL ERROR", StatusCode: 500}
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

func AddUser(email string, username string, password string) (User, error) {
	salt, err := makeSalt()
	if err != nil {
		return User{}, errors.New("UNEXPECTED ERROR")
	}

	var dbUUID string
	var dbEmail string
	var dbUsername string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool
	var dbUserEmailActive bool
	var dbUserEmailToken string
	var dbUserPictureUrl string

	pepper := getPepper()
	emailToken := uuid.New().String()
	hashedPW := hashPW(password, salt, pepper)
	userID := uuid.New().String()
	randPictureInt := rand.Intn(10)
	defaultPicture := "default_" + strconv.Itoa(randPictureInt)
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return User{}, err
	}
	defer conn.Close(ctx)
	q := "INSERT INTO users(uuid, email, username, password, salt, is_admin, email_active, email_token, picture_url) " +
		"VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) " +
		"RETURNING uuid, email, username, password, salt, is_admin, email_active, email_token, picture_url;"
	rows := conn.QueryRow(ctx, q, userID, email, username, hashedPW, salt, false, false, emailToken, defaultPicture)
	err = rows.Scan(
		&dbUUID,
		&dbEmail,
		&dbUsername,
		&dbUserPassword,
		&dbUserSalt,
		&dbUserIsAdmin,
		&dbUserEmailActive,
		&dbUserEmailToken,
		&dbUserPictureUrl)

	if err != nil {
		errString := err.Error()
		if strings.Contains(errString, `duplicate key value violates unique constraint`) {
			return User{}, errors.New("USER EXISTS ALREADY")
		}
		fmt.Println(errString)
		return User{}, errors.New("INTERNAL ERROR")
	}

	return User{
		Uuid:        dbUUID,
		Email:       dbEmail,
		Username:    dbUsername,
		Password:    dbUserPassword,
		Salt:        dbUserSalt,
		IsAdmin:     dbUserIsAdmin,
		EmailActive: dbUserEmailActive,
		EmailToken:  dbUserEmailToken,
	}, nil
}

func RenewEmailToken(email string) (string, error) {
	ctx := context.Background()
	conn, err := pgx.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return "", err
	}
	defer conn.Close(ctx)

	emailToken := uuid.New().String()
	var dbEmailToken string
	q := "UPDATE users SET email_token=$1 WHERE email=$2 RETURNING email_token"
	rows := conn.QueryRow(ctx, q, emailToken, email)
	err = rows.Scan(&dbEmailToken)
	if err != nil {
		return "", err
	}
	return dbEmailToken, nil
}

func CheckPW(user User, email string, password string) (bool, error) {
	pepper := getPepper()
	hashedPW := hashPW(password, user.Salt, pepper)
	return hashedPW == user.Password, nil
}
