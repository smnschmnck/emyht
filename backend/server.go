package main

import (
	"chat/authService"
	"chat/chatService"
	"chat/contactService"
	"chat/dbHelpers/postgresHelper"
	"chat/dbHelpers/redisHelper"
	"chat/userSettingsService"
	"chat/utils"
	"fmt"
	"os"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"

	"github.com/joho/godotenv"
)

var PORT string

// TODO Check if email is active for most requests!
func handleRequest() {
	e := echo.New()
	//TODO: Use Redis for distributed rate limiting
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))
	//CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     utils.GetAllowedCorsOrigins(),
		AllowCredentials: true,
	}))
	//auth
	e.GET("/user", authService.GetUserBySession)
	e.POST("/register", authService.Register)
	e.POST("/verifyEmail", authService.VerifyEmail)
	e.GET("/resendVerificationEmail", authService.ResendVerificationEmail)
	e.POST("/changeEmail", authService.ChangeEmail)
	e.POST("/confirmChangedEmail", authService.ConfirmChangedEmail)
	e.POST("/changeUsername", authService.ChangeUsername)
	e.POST("/login", authService.Authenticate)
	e.GET("/logout", authService.Logout)
	//chats
	e.POST("/startOneOnOneChat", chatService.StartOneOnOneChat)
	e.POST("/startGroupChat", chatService.StartGroupChat)
	e.POST("/addUsersToGroupChat", chatService.AddUsersToGroupChat)
	e.POST("/addSingleUserToGroupChats", chatService.AddSingleUserToGroupChats)
	e.POST("/addUsersToGroupchat", chatService.AddUsersToGroupChat)
	e.GET("/chats", chatService.GetChats)
	e.POST("/message", chatService.SendMessage)
	e.GET("/chatMessages/:chatID", chatService.GetMessages)
	e.GET("/chatInfo/:chatID", chatService.GetChatInfo)
	e.POST("/messageMediaPutURL", chatService.GetMediaPutURL)
	e.POST("/groupChatPicturePutURL", chatService.GetGroupPicturePutURL)
	e.POST("/leaveGroupChat", chatService.LeaveGroupChat)
	e.GET("/oneOnOneChatParticipant/:chatID", chatService.GetOneOnOneChatParticipant)
	e.POST("/getGroupchatsNewUserIsNotPartOf", chatService.GetGroupchatsNewUserIsNotPartOf)
	e.GET("/contactsNotInChat/:chatID", chatService.GetContactsNotInChat)
	//user relationships
	e.POST("/contactRequest", contactService.SendContactRequest)
	e.POST("/handleContactRequest", contactService.HandleContactRequest)
	e.GET("/pendingContactRequests", contactService.GetPendingContactRequests)
	e.GET("/contacts", contactService.GetContacts)
	e.POST("/blockUser", contactService.BlockUser)
	e.GET("/sentContactRequests", contactService.GetSentContactRequests)
	//user settings
	e.POST("/changeProfilePicturePutURL", userSettingsService.GetChangeProfilePicturePutURL)
	e.POST("/confirmChangedProfilePic", userSettingsService.ConfirmChangedProfilePic)
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
	redisHelper.LoadUserSessionsRedisEnv()
	redisHelper.LoadPresignedURLsRedisEnv()
	setPort(3001)
}

func main() {
	initGlobals()
	handleRequest()
}
