package userService

import (
	"chat/auth/authHelpers/globals"
	"chat/dbHelpers/postgresHelper"
	"crypto/rand"
	"crypto/sha512"
	"encoding/hex"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx"
)

type ReqUser struct {
	Email    string `json:"email" validate:"required"`
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type User struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
	Salt     string `json:"salt"`
	IsAdmin  bool   `json:"isAdmin"`
}

func GetUser(email string) (User, error) {
	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return User{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	var dbEmail string
	var dbUsername string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool

	q := "select email, username, password, salt, is_admin from users where email=$1"
	rows := conn.QueryRow(q, email)
	err = rows.Scan(&dbEmail, &dbUsername, &dbUserPassword, &dbUserSalt, &dbUserIsAdmin)
	if err != nil {
		return User{}, errors.New("USER NOT FOUND")
	}

	return User{
		Email:    dbEmail,
		Username: dbUsername,
		Password: dbUserPassword,
		Salt:     dbUserSalt,
		IsAdmin:  dbUserIsAdmin,
	}, nil
}

func hash(s string) string {
	h := sha512.New()
	h.Write([]byte(s))
	sum := h.Sum(nil)
	return hex.EncodeToString(sum)
}

func makeSalt(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

func AddUser(email string, username string, password string) (User, error) {
	salt, err := makeSalt(16)
	pepper := globals.Pepper
	if err != nil {
		return User{}, errors.New("UNEXPECTED ERROR")
	}

	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return User{}, err
	}
	defer conn.Close()

	var dbEmail string
	var dbUsername string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool

	q := "INSERT INTO users VALUES ($1, $2, $3, $4, $5) RETURNING *;"
	rows := conn.QueryRow(q, email, username, hash(password+salt+pepper), salt, false)
	err = rows.Scan(&dbEmail, &dbUsername, &dbUserPassword, &dbUserSalt, &dbUserIsAdmin)

	if err != nil {
		errString := err.Error()
		if strings.Contains(errString, `duplicate key value violates unique constraint`) {
			return User{}, errors.New("USER EXISTS ALREADY")
		}
		fmt.Println(errString)
		return User{}, errors.New("INTERNAL ERROR")
	}

	return User{
		Email:    dbEmail,
		Username: dbUsername,
		Password: dbUserPassword,
		Salt:     dbUserSalt,
		IsAdmin:  dbUserIsAdmin,
	}, nil
}

func CheckPW(email string, password string) (bool, error) {
	user, err := GetUser(email)
	if err != nil {
		return false, err
	}
	pepper := globals.Pepper
	hashedPW := hash(password + user.Salt + pepper)
	return hashedPW == user.Password, nil
}
