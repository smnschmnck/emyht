package main

import (
	"chat/authService"
	"chat/chatService"
	"chat/contactService"
	"chat/dbHelpers/postgresHelper"
	"chat/dbHelpers/redisHelper"
	"chat/wsService"
	"fmt"
	"os"
	"strconv"

	"github.com/labstack/echo/v4"

	"github.com/joho/godotenv"
)

var PORT string

func handleRequest() {
	e := echo.New()
	//Websocket
	e.Any("/ws", wsService.InitializeNewSocketConnection)
	e.POST("/authenticateSocketConnection", wsService.AuthenticateSocketConnection)
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
	e.POST("/message", chatService.SendMessage)
	e.POST("/confirmReadChat", chatService.ConfirmReadChat)
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
