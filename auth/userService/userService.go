package userService

import (
	"chat/dbHelpers/postgresHelper"
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx"
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

func GetUser(email string) (User, error) {
	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return User{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	var dbUUID string
	var dbEmail string
	var dbUsername string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool
	var dbUserEmailActive bool

	q := "select uuid, email, username, password, salt, is_admin, email_active from users where email=$1"
	rows := conn.QueryRow(q, email)
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

	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return User{}, err
	}
	defer conn.Close()

	var dbUUID string
	var dbEmail string
	var dbUsername string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool
	var dbUserEmailActive bool
	var dbUserEmailToken string

	pepper := getPepper()
	emailToken := uuid.New().String()
	hashedPW := hashPW(password, salt, pepper)
	userID := uuid.New().String()
	q := "INSERT INTO users(uuid, email, username, password, salt, is_admin, email_active, email_token) " +
		"VALUES ($1, $2, $3, $4, $5, $6, $7, $8) " +
		"RETURNING uuid, email, username, password, salt, is_admin, email_active, email_token;"
	rows := conn.QueryRow(q, userID, email, username, hashedPW, salt, false, false, emailToken)
	err = rows.Scan(
		&dbUUID,
		&dbEmail,
		&dbUsername,
		&dbUserPassword,
		&dbUserSalt,
		&dbUserIsAdmin,
		&dbUserEmailActive,
		&dbUserEmailToken)

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
	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return "", err
	}
	defer conn.Close()

	emailToken := uuid.New().String()
	var dbEmailToken string
	q := "UPDATE users SET email_token=$1 WHERE email=$2 RETURNING email_token"
	rows := conn.QueryRow(q, emailToken, email)
	err = rows.Scan(&dbEmailToken)
	if err != nil {
		return "", err
	}
	return dbEmailToken, nil
}

func CheckPW(email string, password string) (bool, error) {
	user, err := GetUser(email)
	if err != nil {
		return false, err
	}
	pepper := getPepper()
	hashedPW := hashPW(password, user.Salt, pepper)
	return hashedPW == user.Password, nil
}
