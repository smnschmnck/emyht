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
	Username string `json:"username" validate:"required"`
	Email    string `json:"email" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type User struct {
	Username string `json:"username"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Salt     string `json:"salt"`
	IsAdmin  bool   `json:"isAdmin"`
}

func GetUser(username string) (User, error) {
	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return User{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	var dbUsername string
	var dbEmail string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool

	q := "select username, email, password, salt, is_admin from users where username=$1"
	rows := conn.QueryRow(q, username)
	err = rows.Scan(&dbUsername, &dbEmail, &dbUserPassword, &dbUserSalt, &dbUserIsAdmin)
	if err != nil {
		return User{}, errors.New("USER NOT FOUND")
	}

	return User{
		Username: dbUsername,
		Email:    dbEmail,
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

func AddUser(username string, email string, password string) (User, error) {
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

	var dbUsername string
	var dbEmail string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool

	q := "INSERT INTO users VALUES ($1, $2, $3, $4, $5) RETURNING *;"
	rows := conn.QueryRow(q, username, email, hash(password+salt+pepper), salt, false)
	err = rows.Scan(&dbUsername, &dbEmail, &dbUserPassword, &dbUserSalt, &dbUserIsAdmin)

	if err != nil {
		errString := err.Error()
		if strings.Contains(errString, `duplicate key value violates unique constraint`) {
			return User{}, errors.New("USER EXISTS ALREADY")
		}
		fmt.Println(errString)
		return User{}, errors.New("INTERNAL ERROR")
	}

	return User{
		Username: dbUsername,
		Email:    dbEmail,
		Password: dbUserPassword,
		Salt:     dbUserSalt,
		IsAdmin:  dbUserIsAdmin,
	}, nil
}

func CheckPW(username string, password string) (bool, error) {
	user, err := GetUser(username)
	if err != nil {
		return false, err
	}
	pepper := globals.Pepper
	hashedPW := hash(password + user.Salt + pepper)
	return hashedPW == user.Password, nil
}
