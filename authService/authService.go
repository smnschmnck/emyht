package authService

import (
	"auth/dbHelpers/postgresHelper"
	"auth/userService"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/jackc/pgx"
)

var validate = validator.New()

type Session struct{
	SessionID string `json:"sessionID"`
	Username string `json:"username"`
}

func GetUser(w http.ResponseWriter, r*http.Request)  {
	bearerArr := strings.Split(r.Header.Get("authorization"), "Bearer ")

	if(len(bearerArr) <= 1){
		w.WriteHeader(401)
		fmt.Fprintf(w, "NOT AUTHORIZED")
		return
	}

	sessionID := bearerArr[1]

	user, err := getUserBySessionID(sessionID)

	if err.StatusCode >= 300 {
		w.WriteHeader(err.StatusCode)
		fmt.Fprint(w, err.Msg)
		return
	}

	json.NewEncoder(w).Encode(user)
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

func startSession(w http.ResponseWriter, username string) (Session, error){
	token, err := makeToken(32);
	if(err != nil){
		w.WriteHeader(500);
		fmt.Fprintf(w, "SOMETHING WENT WRONG")
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

func Register(w http.ResponseWriter, r*http.Request){
	var reqUser userService.ReqUser
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err := decoder.Decode(&reqUser)
	if(err != nil){
		w.WriteHeader(400)
		fmt.Fprintf(w, "BAD REQUEST")
		return
	}
	err = validate.Struct(reqUser);
	if(err != nil){
		w.WriteHeader(400)
		fmt.Fprintf(w, "BAD REQUEST")
		return
	}
	_, err = userService.AddUser(reqUser.Username, reqUser.FirstName, reqUser.LastName, reqUser.Password)

	if(err != nil){
		errString := err.Error()
		if(errString == "USER EXISTS ALREADY"){
			w.WriteHeader(409)
			fmt.Fprint(w, errString)
		}else{
			w.WriteHeader(500)
			fmt.Fprint(w, errString)
		}
		return;
	}

	session, err := startSession(w, reqUser.Username)

	if err != nil {
		w.WriteHeader(500)
		fmt.Fprintf(w, "Something went wrong while creating your Account")
		return
	}

	json.NewEncoder(w).Encode(session)
}

func Authenticate(w http.ResponseWriter, r*http.Request){
	var credentials Credentials
	err := json.NewDecoder(r.Body).Decode(&credentials)
	if(err != nil){
		w.WriteHeader(500);
		fmt.Fprintf(w, "SOMETHING WENT WRONG")
		return
	}
	pwCorrect := userService.CheckPW(credentials.Username, credentials.Password)
	if(pwCorrect){
		session, err := startSession(w, credentials.Username)
		if err != nil {
			w.WriteHeader(500)
			fmt.Fprintf(w, "Something went wrong while authenticating")
			return
		}
		json.NewEncoder(w).Encode(session)
		return
	}
	w.WriteHeader(401);
	fmt.Fprintf(w, "WRONG CREDENTIALS")
}