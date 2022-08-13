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

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

var PORT string

func handleRequest() {
	app := fiber.New()
	//auth
	app.Get("/user", authService.GetUserBySession)
	app.Post("/register", authService.Register)
	app.Post("/verifyEmail", authService.VerifyEmail)
	app.Get("/resendVerificationEmail", authService.ResendVerificationEmail)
	app.Post("/changeEmail", authService.ChangeEmail)
	app.Post("/confirmChangedEmail", authService.ConfirmChangedEmail)
	app.Post("/login", authService.Authenticate)
	app.Get("/logout", authService.Logout)
	//chats
	app.Post("/startOneOnOneChat", chatService.StartOneOnOneChat)
	app.Get("/chats", chatService.GetChats)
	app.Post("/message", chatService.SendMessage)
	app.Get("/chatMessages/:chatID", chatService.GetMessages)
	//user relationships
	app.Post("/contactRequest", contactService.SendContactRequest)
	app.Post("/handleContactRequest", contactService.HandleContactRequest)
	app.Get("/pendingContactRequests", contactService.GetPendingContactRequests)
	app.Get("/contacts", contactService.GetContacts)
	app.Listen(PORT)
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
