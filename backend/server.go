package main

import (
	"chat/authService"
	"chat/chatService"
	"chat/contactService"
	"chat/db"
	authmw "chat/middleware"
	"chat/pusher"
	"chat/redisdb"
	"chat/userSettingsService"
	"chat/utils"
	"os"
	"strconv"

	_ "github.com/joho/godotenv/autoload"
	"github.com/labstack/echo/v5"
	"github.com/labstack/echo/v5/middleware"
)

var PORT string

func handleRequest() {
	e := echo.New()
	e.Use(middleware.Gzip())
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))
	//CORS
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: utils.GetAllowedCorsOrigins(),
	}))

	// All routes below require a valid Auth0 JWT
	e.Use(authmw.Auth())

	// Pusher
	e.POST("/pusher/auth", pusher.PusherAuth)
	// User
	e.GET("/user", authService.GetUser)
	e.POST("/changeUsername", authService.ChangeUsername)
	// Chats
	e.POST("/startOneOnOneChat", chatService.StartOneOnOneChat)
	e.POST("/startGroupChat", chatService.StartGroupChat)
	e.POST("/addSingleUserToGroupChats", chatService.AddSingleUserToGroupChats)
	e.POST("/addUsersToGroupchat", chatService.AddUsersToGroupChat)
	e.GET("/chats", chatService.GetChats)
	e.POST("/message", chatService.SendMessage)
	e.POST("/changeGroupName/:chatID", chatService.ChangeGroupName)
	e.POST("/changeGroupPicture/:chatID", chatService.ChangeGroupPicture)
	e.GET("/chatMessages/:chatID", chatService.GetMessages)
	e.GET("/chatInfo/:chatID", chatService.GetChatInfo)
	e.GET("/groupMembers/:chatID", chatService.GetChatParticipantsExceptUser)
	e.PUT("/removeGroupMembers/:chatID", chatService.RemoveUsersFromGroupChat)
	e.POST("/messageMediaPutURL", chatService.GetMediaPutURL)
	e.POST("/groupChatPicturePutURL", chatService.GetGroupPicturePutURL)
	e.POST("/leaveGroupChat", chatService.LeaveGroupChat)
	e.GET("/oneOnOneChatParticipant/:chatID", chatService.GetOneOnOneChatParticipant)
	e.GET("/getGroupchatsNewUserIsNotPartOf/:uuid", chatService.GetGroupchatsNewUserIsNotPartOf)
	e.GET("/contactsNotInChat/:chatID", chatService.GetContactsNotInChat)
	// Contacts
	e.POST("/contactRequest", contactService.SendContactRequest)
	e.POST("/handleContactRequest", contactService.HandleContactRequest)
	e.GET("/pendingContactRequests", contactService.GetPendingContactRequests)
	e.GET("/contacts", contactService.GetContacts)
	e.POST("/blockUser", contactService.BlockUser)
	e.POST("/unblockUser", contactService.UnblockUser)
	e.GET("/sentContactRequests", contactService.GetSentContactRequests)
	// User settings
	e.POST("/changeProfilePicturePutURL", userSettingsService.GetChangeProfilePicturePutURL)
	e.POST("/confirmChangedProfilePic", userSettingsService.ConfirmChangedProfilePic)

	if err := e.Start(PORT); err != nil {
		e.Logger.Error("failed to start server", "error", err)
	}
}

func setPort(defaultPort int) {
	envPort := os.Getenv("PORT")
	if envPort != "" {
		PORT = ":" + envPort
	} else {
		PORT = ":" + strconv.Itoa(defaultPort)
	}
}

func initGlobals() {
	redisdb.InitializePresignedUrlsRedis()
	setPort(3001)
}

func main() {
	db.InitDB()
	defer db.Close()
	initGlobals()
	handleRequest()
}
