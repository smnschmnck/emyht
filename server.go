package main

import (
	"chat/authService"
	"chat/chatService"
	"chat/contactService"
	"chat/dbHelpers/postgresHelper"
	"chat/dbHelpers/redisHelper"
	"fmt"
	"os"
	"strconv"

	"github.com/gorilla/websocket"
	"github.com/labstack/echo/v4"

	"github.com/joho/godotenv"
)

var PORT string

var (
	upgrader = websocket.Upgrader{}
)

var wsConnections []*websocket.Conn

func appendWebSocket(c echo.Context) error {
	ws, err := upgrader.Upgrade(c.Response(), c.Request(), nil)
	ws.WriteMessage(websocket.TextMessage, []byte("Hello there!"))
	wsConnections = append(wsConnections, ws)
	return err
}

func handleRequest() {
	e := echo.New()
	//socket
	e.GET("/ws", appendWebSocket)
	//auth
	e.GET("/user", authService.GetUserBySession)
	e.POST("/register", authService.Register)
	e.POST("/verifyEmail", authService.VerifyEmail)
	e.GET("/resendVerificationEmail", authService.ResendVerificationEmail)
	e.POST("/changeEmail", authService.ChangeEmail)
	e.POST("/confirmChangedEmail", authService.ConfirmChangedEmail)
	e.POST("/login", authService.Authenticate)
	e.GET("/logout", authService.Logout)
	//chats
	e.POST("/startOneOnOneChat", chatService.StartOneOnOneChat)
	e.GET("/chats", chatService.GetChats)
	e.POST("/message", func(c echo.Context) error {
		return chatService.SendMessage(c, wsConnections)
	})
	e.GET("/chatMessages/:chatID", chatService.GetMessages)
	//user relationships
	e.POST("/contactRequest", contactService.SendContactRequest)
	e.POST("/handleContactRequest", contactService.HandleContactRequest)
	e.GET("/pendingContactRequests", contactService.GetPendingContactRequests)
	e.GET("/contacts", contactService.GetContacts)
	e.Logger.Fatal(e.Start(PORT))
}

func setPort(defaultPort int) {
	envPort := os.Getenv("PORT")
	if envPort != "" {
		PORT = ":" + envPort
	} else {
		PORT = ":" + strconv.Itoa(defaultPort)
	}
}

func loadDotEnv() {
	godotenv.Load()
	err := godotenv.Load()
	if err != nil {
		fmt.Println(string("\033[31m"), "No .env file. Using default or runtime vars")
	}
}

func initGlobals() {
	loadDotEnv()
	postgresHelper.LoadEnv()
	redisHelper.LoadEnv()
	setPort(3001)
}

func main() {
	initGlobals()
	handleRequest()
}
