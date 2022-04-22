package userService

import (
	"chat/auth/authHelpers/globals"
	"chat/dbHelpers/postgresHelper"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"strings"

	"github.com/jackc/pgx"
)

type ReqUser struct {
	Username string `json:"username" validate:"required"`
	FirstName string `json:"firstName" validate:"required"`
	LastName string `json:"lastName" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type User struct {
	Username string `json:"username"`
	FirstName string `json:"firstName"`
	LastName string `json:"lastName"`
	Password string `json:"password"`
	Salt string `json:"salt"`
	IsAdmin bool `json:"isAdmin"`
}

func GetUser(username string) (User, error){
	conn, err := pgx.Connect(postgresHelper.PGConfig)
	if err != nil {
		return User{}, err
	}
	defer conn.Close()

	var dbUsername string
	var dbFirstName string
	var dbLastName string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool

	q := "select username, first_name, last_name, password, salt, is_admin from users where username=$1"
	rows := conn.QueryRow(q, username)
	err = rows.Scan(&dbUsername, &dbFirstName, &dbLastName, &dbUserPassword, &dbUserSalt, &dbUserIsAdmin)
	if err != nil {
		return User{}, errors.New("INTERNAL ERROR")
	}

	return User{
		Username: dbUsername,
		FirstName: dbFirstName,
		LastName: dbLastName,
		Password: dbUserPassword,
		Salt: dbUserSalt,
		IsAdmin: dbUserIsAdmin,
	}, nil
}

func hash(s string) string{
	h := sha256.New();
	h.Write([]byte(s));
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

func AddUser(username string, firstName string, lastName string, password string) (User, error){
	salt, err := makeSalt(16);
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
	var dbFirstName string
	var dbLastName string
	var dbUserPassword string
	var dbUserSalt string
	var dbUserIsAdmin bool

	q := "INSERT INTO users VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;"
	rows := conn.QueryRow(q, username, firstName, lastName, hash(password + salt + pepper), salt, false)
	err = rows.Scan(&dbUsername, &dbFirstName, &dbLastName, &dbUserPassword, &dbUserSalt, &dbUserIsAdmin)

	if err != nil {
		errString := err.Error()
		if(strings.Contains(errString, `duplicate key value violates unique constraint "users_pk"`)){
			return User{}, errors.New("USER EXISTS ALREADY")
		}
		return User{}, errors.New("INTERNAL ERROR")
	}

	return User{
		Username: dbUsername,
		FirstName: dbFirstName,
		LastName: dbLastName,
		Password: dbUserPassword,
		Salt: dbUserSalt,
		IsAdmin: dbUserIsAdmin,
	}, nil
}

func CheckPW(username string, password string) bool{
	user, err := GetUser(username);
	if err != nil{
		return false
	}
	pepper := globals.Pepper
	hashedPW := hash(password + user.Salt + pepper)
	return hashedPW == user.Password
}