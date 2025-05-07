package main

import (
	"chat/authService"
	"chat/chatService"
	"chat/contactService"
	"chat/db"
	"chat/pusher"
	"chat/redisdb"
	"chat/userSettingsService"
	"chat/utils"
	"os"
	"strconv"

	_ "github.com/joho/godotenv/autoload"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

var PORT string

// TODO Check if email is active for most requests!
func handleRequest() {
	e := echo.New()
	//TODO: Use Redis for distributed rate limiting
	e.Use(middleware.RateLimiter(middleware.NewRateLimiterMemoryStore(20)))
	// Pusher
	e.POST("/pusher/auth", pusher.PusherAuth)
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
	e.POST("/addSingleUserToGroupChats", chatService.AddSingleUserToGroupChats)
	e.POST("/addUsersToGroupchat", chatService.AddUsersToGroupChat)
	e.GET("/chats", chatService.GetChats)
	e.POST("/message", chatService.SendMessage)
	e.POST("/changeGroupName/:chatID", chatService.ChangeGroupName)
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

func initGlobals() {
	redisdb.InitializePresignedUrlsRedis()
	redisdb.InitializeSessionsRedis()
	setPort(3001)
}

func main() {
	db.InitDB()
	defer db.Close()
	initGlobals()
	handleRequest()
}
