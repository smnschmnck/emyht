package chatService

import (
	"chat/authService"
	"chat/chatHelpers"
	"chat/contactService"
	"chat/db"
	"chat/pusher"
	"chat/queries"
	"chat/s3Helpers"
	"chat/userService"
	"context"
	"errors"
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/go-playground/validator/v10"
)

var validate = validator.New()

func StartOneOnOneChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type startReq struct {
		ParticipantUUID string `json:"participantUUID" validate:"required"`
	}
	req := new(startReq)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	contacts, err := contactService.GetUserContactsbyUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	isInContacts := false
	for _, c := range contacts {
		if c.Uuid == req.ParticipantUUID {
			isInContacts = true
			break
		}
	}
	if !isInContacts {
		return c.String(http.StatusInternalServerError, "USER NOT IN CONTACTS")
	}

	conn := db.GetDB()

	chatExists, err := conn.CheckChatExists(context.Background(), queries.CheckChatExistsParams{Uuid: reqUUID, Uuid_2: req.ParticipantUUID})
	if err != nil {
		if err.Error() == "no rows in result set" {
			chatExists = false
		} else {
			return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
		}
	}
	if chatExists {
		return c.String(http.StatusConflict, "CHAT EXISTS ALREADY")
	}

	chatID := uuid.New().String()

	_, err = conn.CreateOneOnOneChat(context.Background(), queries.CreateOneOnOneChatParams{ChatID: chatID, CreationTimestamp: time.Now().Unix()})
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	_, err = conn.InsertUserChat(context.Background(), queries.InsertUserChatParams{Uuid: reqUUID, ChatID: chatID})
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	_, err = conn.InsertParticipantChat(context.Background(), queries.InsertParticipantChatParams{Uuid: req.ParticipantUUID, ChatID: chatID})
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	err = pusher.PusherClient.Trigger(pusher.USER_FEED_PREFIX+req.ParticipantUUID, pusher.CHAT_EVENT, nil)
	if err != nil {
		fmt.Println(err)
	}

	return c.String(http.StatusOK, "SUCCESS")
}

func StartGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type startReq struct {
		ChatName         string   `json:"chatName" validate:"required"`
		ChatPictureID    string   `json:"chatPictureID"`
		ParticipantUUIDs []string `json:"participantUUIDs" validate:"required"`
	}
	req := new(startReq)
	err = c.Bind(&req)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		fmt.Println(err)

		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	isInContacts, err := contactService.AreUsersInContacts(req.ParticipantUUIDs, reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if !isInContacts {
		return c.String(http.StatusUnauthorized, "NOT ALL USERS IN CONTACTS")
	}

	conn := db.GetDB()

	var chatPicture string
	if req.ChatPictureID != "" {
		imageKey := reqUUID + "/gcPictures/" + req.ChatPictureID + ".png"
		imageExists, err := s3Helpers.CheckFileExists(imageKey)
		if err != nil {
			return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
		}
		if !imageExists {
			return c.String(http.StatusNotFound, "IMAGEID NOT FOUND")
		}
		chatPicture = "storage.emyht.com/" + imageKey
	} else {
		randPictureInt := rand.Intn(10)
		defaultPicture := "default_group_" + strconv.Itoa(randPictureInt)
		chatPicture = defaultPicture
	}

	//CREATE CHAT
	chatID := uuid.New().String()
	_, err = conn.CreateGroupChat(context.Background(), queries.CreateGroupChatParams{ChatID: chatID, Name: req.ChatName, PictureUrl: chatPicture, CreationTimestamp: time.Now().Unix()})
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	//INSERT ALL PARTICIPANTS INTO CHAT
	rows := [][]any{}
	rows = append(rows, []any{reqUUID, chatID, 0})
	for _, p := range req.ParticipantUUIDs {
		rows = append(rows, []any{p, chatID, 0})
	}

	rawConn := db.GetRawConn()

	copyCount, err := rawConn.CopyFrom(
		context.Background(),
		pgx.Identifier{"user_chat"},
		[]string{"uuid", "chat_id", "unread_messages"},
		pgx.CopyFromRows(rows),
	)
	if err != nil || int(copyCount) != len(req.ParticipantUUIDs)+1 {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	chats, err := chatHelpers.GetChatsByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	pusherEvents := pusher.MakePusherEventArray(pusher.USER_FEED_PREFIX, req.ParticipantUUIDs, pusher.CHAT_EVENT, nil)
	pusher.PusherClient.TriggerBatch(pusherEvents)

	return c.JSON(http.StatusOK, chats)
}

func addUsersToGroupChat(participantUUIDs []string, uuid string, chatId string) ([]queries.GetChatsForUserRow, error) {
	emptyChatArray := make([]queries.GetChatsForUserRow, 0)
	isInContacts, err := contactService.AreUsersInContacts(participantUUIDs, uuid)
	if err != nil {
		return emptyChatArray, errors.New("INTERNAL ERROR")
	}

	if !isInContacts {
		return make([]queries.GetChatsForUserRow, 0), errors.New("NOT ALL USERS IN CONTACTS")
	}

	conn := db.GetDB()

	dbChatID, err := conn.ValidateChatID(context.Background(), chatId)
	if err != nil {
		return emptyChatArray, errors.New("CHAT NOT FOUND")
	}

	chatType, err := conn.GetChatType(context.Background(), dbChatID)
	if err != nil {
		return emptyChatArray, errors.New("INTERNAL ERROR")
	}

	if chatType != queries.ChatTypeGroup {
		return emptyChatArray, errors.New("CHAT IS NOT GROUP CHAT")
	}

	//CHECK IF USER IS IN CHAT
	userInChat, err := chatHelpers.IsUserInChat(uuid, dbChatID)
	if err != nil {
		return emptyChatArray, errors.New("INTERNAL ERROR")
	}

	if !userInChat {
		return emptyChatArray, errors.New("NO AUTH")
	}

	//INSERT ALL PARTICIPANTS INTO CHAT
	rows := [][]any{}
	for _, p := range participantUUIDs {
		rows = append(rows, []any{p, dbChatID, 0})
	}

	rawConn := db.GetRawConn()

	copyCount, err := rawConn.CopyFrom(
		context.Background(),
		pgx.Identifier{"user_chat"},
		[]string{"uuid", "chat_id", "unread_messages"},
		pgx.CopyFromRows(rows),
	)

	if err != nil || int(copyCount) != len(participantUUIDs) {
		return emptyChatArray, errors.New("INTERNAL ERROR")
	}

	chats, err := chatHelpers.GetChatsByUUID(uuid)
	if err != nil {
		return emptyChatArray, errors.New("INTERNAL ERROR")
	}

	pusherEvents := pusher.MakePusherEventArray(pusher.USER_FEED_PREFIX, participantUUIDs, "NEW_CHAT", nil)
	pusher.PusherClient.TriggerBatch(pusherEvents)

	return chats, nil
}

func AddUsersToGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type request struct {
		ParticipantUUIDs []string `json:"participantUUIDs"`
		ChatID           string   `json:"chatID"`
	}

	req := new(request)
	if err := c.Bind(req); err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	chats, err := addUsersToGroupChat(req.ParticipantUUIDs, reqUUID, req.ChatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, chats)
}

func GetChatParticipantsExceptUser(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")

	chatParticipants, err := getChatMembers(chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	inChat := false
	for _, p := range chatParticipants {
		if p.Uuid == reqUUID {
			inChat = true
			break
		}
	}

	if !inChat {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	var participantsExceptUser []queries.GetChatMembersRow
	for _, p := range chatParticipants {
		if p.Uuid != reqUUID {
			participantsExceptUser = append(participantsExceptUser, p)
		}
	}

	return c.JSON(http.StatusOK, participantsExceptUser)
}

func GetChats(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chats, err := chatHelpers.GetChatsByUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	for i, chat := range chats {
		chats[i].ChatPictureUrl = s3Helpers.FormatPictureUrl(chat.ChatPictureUrl)
	}

	return c.JSON(http.StatusOK, chats)
}

func SendMessage(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type reqBody struct {
		ChatID      string `json:"chatID" validate:"required"`
		TextContent string `json:"textContent"`
		MessageType string `json:"messageType" validate:"required"`
		FileID      string `json:"fileID"`
	}

	req := new(reqBody)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		fmt.Println(err)
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	if len(req.TextContent) > 4096 {
		return c.String(http.StatusBadRequest, "MESSAGE TOO LONG")
	}

	//make sure platform only media URLs are being sent. TLDR: More comprehensive validation
	fileExists := len(req.FileID) > 0
	formattedFileID := ""
	if fileExists {
		if req.MessageType == "plaintext" {
			return c.String(http.StatusBadRequest, "FILES NOT ALLOWED FOR TYPE PLAINTEXT")
		}
		formattedFileID = "storage.emyht.com/" + reqUUID + "/userData/" + req.FileID
	}

	if req.MessageType == "plaintext" && len(req.TextContent) < 1 {
		return c.String(http.StatusBadRequest, "MESSAGE TOO SHORT")
	}

	inChat, err := chatHelpers.IsUserInChat(reqUUID, req.ChatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	if !inChat {
		return c.String(http.StatusUnauthorized, "USER NOT IN CHAT")
	}

	conn := db.GetDB()

	messageID, err := conn.CreateChatMessage(context.Background(), queries.CreateChatMessageParams{
		MessageID:   uuid.NewString(),
		ChatID:      req.ChatID,
		SenderID:    reqUUID,
		TextContent: &req.TextContent,
		MessageType: queries.MessageType(req.MessageType),
		MediaUrl:    &formattedFileID,
		Timestamp:   time.Now().Unix()})
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	chatID, err := conn.UpdateLastMessageID(context.Background(), queries.UpdateLastMessageIDParams{
		LastMessageID: &messageID,
		ChatID:        req.ChatID})
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	querySuccess, err := conn.IncrementUnreadMessages(context.Background(), queries.IncrementUnreadMessagesParams{ChatID: chatID, Uuid: reqUUID})
	if err != nil || !querySuccess {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	messages, err := getMessagesByChatID(chatID, reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	err = sendNewMessageNotification(chatID)
	if err != nil {
		fmt.Println(err)
	}

	return c.JSON(http.StatusOK, messages)
}

func getMessagesByChatID(chatID string, uuid string) ([]queries.GetChatMessagesRow, error) {
	inChat, err := chatHelpers.IsUserInChat(uuid, chatID)
	emptyMessageArr := make([]queries.GetChatMessagesRow, 0)
	if err != nil {
		return emptyMessageArr, err
	}
	if !inChat {
		return emptyMessageArr, errors.New("USER NOT IN CHAT")
	}

	conn := db.GetDB()

	messages, err := conn.GetChatMessages(context.Background(), chatID)
	if err != nil {
		return emptyMessageArr, errors.New("INTERNAL ERROR")
	}

	if messages == nil {
		return emptyMessageArr, nil
	}

	for i, message := range messages {
		formattedUrl := s3Helpers.FormatPictureUrl(*message.MediaUrl)
		messages[i].MediaUrl = &formattedUrl
	}

	return messages, nil
}

func GetMessages(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}

	messages, err := getMessagesByChatID(chatID, reqUUID)

	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	err = markChatAsRead(reqUUID, chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	return c.JSON(http.StatusOK, messages)
}

func markChatAsRead(uuid string, chatID string) error {
	conn := db.GetDB()

	err := conn.ResetUnreadMessages(context.Background(), queries.ResetUnreadMessagesParams{ChatID: chatID, Uuid: uuid})
	if err != nil {
		return errors.New("INTERNAL ERROR")
	}

	return nil
}

func getChatMembers(chatId string) ([]queries.GetChatMembersRow, error) {
	conn := db.GetDB()

	uuids, err := conn.GetChatMembers(context.Background(), chatId)
	if err != nil {
		return nil, err
	}
	return uuids, nil
}

func sendNewMessageNotification(chatId string) error {

	return pusher.PusherClient.Trigger(pusher.CHAT_PREFIX+chatId, pusher.MESSAGE_EVENT, nil)
}

func GetChatInfo(c echo.Context) error {
	type chatInfoRes struct {
		Info string `json:"info"`
	}

	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}
	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}
	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}
	userInChat, err := chatHelpers.IsUserInChat(reqUUID, chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}
	if !userInChat {
		return c.String(http.StatusUnauthorized, "USER NOT IN CHAT")
	}

	conn := db.GetDB()

	isGroupChat, err := conn.IsGroupChat(context.Background(), chatID)
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if isGroupChat {
		groupChatUsers, err := conn.GetGroupChatUserCount(context.Background(), chatID)
		if err != nil {
			fmt.Println(err.Error())
			return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
		}
		out := fmt.Sprint(groupChatUsers) + " member"
		if groupChatUsers > 1 {
			out += "s"
		}
		return c.JSON(http.StatusOK, chatInfoRes{Info: out})
	}

	//TODO: Actually fetch last online
	return c.JSON(http.StatusOK, chatInfoRes{Info: "14:21"})
}

func GetMediaPutURL(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	const MEGABYTE int64 = 1000000
	const MAX_SIZE = 64 * MEGABYTE
	type reqBody struct {
		FileName      string `json:"fileName" validate:"required"`
		ContentLength int64  `json:"contentLength" validate:"required"`
	}
	req := new(reqBody)
	err = c.Bind(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	if req.ContentLength > MAX_SIZE {
		return c.String(http.StatusBadRequest, "FILE TOO BIG")
	}

	fileID := uuid.New().String() + "_" + req.FileName
	fileName := reqUUID + "/userData/" + fileID

	presignedPutUrl, err := s3Helpers.PresignPutObject(fileName, time.Hour, req.ContentLength)
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		FileID          string `json:"fileID"`
		PresignedPutUrl string `json:"presignedPutURL"`
	}

	return c.JSON(http.StatusOK, res{PresignedPutUrl: presignedPutUrl, FileID: fileID})
}

func GetGroupPicturePutURL(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	const MEGABYTE int64 = 1000000
	const MAX_SIZE = 1 * MEGABYTE
	type reqBody struct {
		ContentLength int64 `json:"contentLength" validate:"required"`
	}
	req := new(reqBody)
	err = c.Bind(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	if req.ContentLength > MAX_SIZE {
		return c.String(http.StatusBadRequest, "FILE TOO BIG")
	}

	fileID := uuid.New().String()
	fileName := reqUUID + "/gcPictures/" + fileID + ".png"

	presignedPutUrl, err := s3Helpers.PresignPutObject(fileName, time.Hour, req.ContentLength)
	if err != nil {
		c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		FileID          string `json:"fileID"`
		PresignedPutUrl string `json:"presignedPutURL"`
	}

	return c.JSON(http.StatusOK, res{PresignedPutUrl: presignedPutUrl, FileID: fileID})
}

func LeaveGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type leaveReq struct {
		ChatID string `json:"chatId" validate:"required"`
	}
	req := new(leaveReq)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	inChat, err := chatHelpers.IsUserInChat(reqUUID, req.ChatID)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if !inChat {
		return c.String(http.StatusUnauthorized, "NOT IN CHAT")
	}

	conn := db.GetDB()

	isGroupChat, err := conn.IsGroupChat(context.Background(), req.ChatID)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	if !isGroupChat {
		return c.String(http.StatusBadRequest, "NOT A GROUP CHAT")
	}

	err = conn.LeaveGroupChat(context.Background(), queries.LeaveGroupChatParams{ChatID: req.ChatID, Uuid: reqUUID})
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	chats, err := chatHelpers.GetChatsByUUID(reqUUID)
	if err != nil {
		log.Println(err)
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	return c.JSON(http.StatusOK, chats)
}

func getGroupchatsNewUserIsNotPartOf(uuid string, newUserUUID string) ([]queries.GetAvailableGroupChatsRow, error) {
	conn := db.GetDB()

	chats, err := conn.GetAvailableGroupChats(context.Background(), queries.GetAvailableGroupChatsParams{Uuid: uuid, Uuid_2: newUserUUID})
	if err != nil {
		return nil, errors.New("INTERNAL ERROR")
	}

	return chats, nil
}

func GetGroupchatsNewUserIsNotPartOf(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	newUserId := c.Param("uuid")
	if len(newUserId) <= 0 {
		return c.String(http.StatusBadRequest, "UUID MISSING")
	}

	groupChats, err := getGroupchatsNewUserIsNotPartOf(reqUUID, newUserId)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	for i, chat := range groupChats {
		groupChats[i].PictureUrl = s3Helpers.FormatPictureUrl(chat.PictureUrl)
	}

	return c.JSON(http.StatusOK, groupChats)
}

func AddSingleUserToGroupChats(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	type addReq struct {
		ChatIDs         []string `json:"chatIDs" validate:"required"`
		ParticipantUUID string   `json:"participantUUID" validate:"required"`
	}
	req := new(addReq)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	participantUUIDAsSlice := []string{req.ParticipantUUID}
	userInContacts, err := contactService.AreUsersInContacts(participantUUIDAsSlice, reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	if !userInContacts {
		return c.String(http.StatusUnauthorized, "USER NOT IN CONTACTS")
	}

	potentialChats, err := getGroupchatsNewUserIsNotPartOf(reqUUID, req.ParticipantUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	for _, chatID := range req.ChatIDs {
		canAdd := false
		for _, potentialChat := range potentialChats {
			if chatID == potentialChat.ChatID {
				canAdd = true
				break
			}
		}
		if !canAdd {
			return c.String(http.StatusUnauthorized, "YOU ARE NOT ALLOWED TO ADD A USER TO ALL OF THESE CHATS")
		}
	}

	rawConn := db.GetRawConn()

	rows := [][]any{}
	for _, chatID := range req.ChatIDs {
		rows = append(rows, []any{req.ParticipantUUID, chatID, 0})
	}

	copyCount, err := rawConn.CopyFrom(
		context.Background(),
		pgx.Identifier{"user_chat"},
		[]string{"uuid", "chat_id", "unread_messages"},
		pgx.CopyFromRows(rows),
	)

	if err != nil || int(copyCount) != len(req.ChatIDs) {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	pusher.PusherClient.Trigger(pusher.USER_FEED_PREFIX+req.ParticipantUUID, pusher.CHAT_EVENT, nil)

	return c.String(http.StatusOK, "SUCCESS")
}

func ChangeGroupName(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}

	type changeNameReq struct {
		NewName string `json:"newName" validate:"required"`
	}
	req := new(changeNameReq)
	err = c.Bind(&req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}
	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	userInChat, err := chatHelpers.IsUserInChat(reqUUID, chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	if !userInChat {
		c.String(http.StatusUnauthorized, "YOU ARE NOT A PARTICIPANT OF THIS CHAT")
	}

	conn := db.GetDB()

	err = conn.ChangeGroupName(context.Background(), queries.ChangeGroupNameParams{Name: req.NewName, ChatID: chatID})
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusInternalServerError, "SOMETHING WENT WRONG")
	}

	return c.String(http.StatusOK, "SUCCESS")
}

func GetOneOnOneChatParticipant(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}

	userInChat, err := chatHelpers.IsUserInChat(reqUUID, chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}
	if !userInChat {
		c.String(http.StatusUnauthorized, "YOU ARE NOT A PARTICIPANT OF THIS CHAT")
	}

	conn := db.GetDB()

	participantUUID, err := conn.GetOneOnOneChatParticipant(context.Background(), queries.GetOneOnOneChatParticipantParams{ChatID: chatID, Uuid: reqUUID})
	if err != nil {
		return c.String(http.StatusInternalServerError, "INTERNAL ERROR")
	}

	type res struct {
		ParticipantUUID string `json:"participantUUID"`
	}

	return c.JSON(http.StatusOK, res{ParticipantUUID: participantUUID})
}

func GetContactsNotInChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}

	chatMembers, err := getChatMembers(chatID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	contacts, err := contactService.GetUserContactsbyUUID(reqUUID)
	if err != nil {
		return c.String(http.StatusInternalServerError, err.Error())
	}

	contactsAsMap := make(map[string]queries.GetUserContactsRow)

	for _, contact := range contacts {
		contactsAsMap[contact.Uuid] = contact
	}

	for _, chatMember := range chatMembers {
		delete(contactsAsMap, chatMember.Uuid)
	}

	usersNotInChat := make([]queries.GetUserContactsRow, len(contactsAsMap))

	i := 0
	for _, user := range contactsAsMap {
		usersNotInChat[i] = user
		i++
	}

	for i, contact := range usersNotInChat {
		contacts[i].PictureUrl = s3Helpers.FormatPictureUrl(contact.PictureUrl)
	}

	return c.JSON(http.StatusOK, usersNotInChat)
}

func RemoveUsersFromGroupChat(c echo.Context) error {
	sessionID, responseErr := authService.GetSessionToken(c)
	if responseErr != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	reqUUID, err := userService.GetUUIDBySessionID(sessionID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	chatID := c.Param("chatID")
	if len(chatID) <= 0 {
		return c.String(http.StatusBadRequest, "MISSING CHAT ID")
	}

	type request struct {
		UuidsToRemove []string `json:"uuidsToRemove"`
	}

	req := new(request)
	if err := c.Bind(req); err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	err = validate.Struct(req)
	if err != nil {
		return c.String(http.StatusBadRequest, "BAD REQUEST")
	}

	isInChat, err := chatHelpers.IsUserInChat(reqUUID, chatID)
	if err != nil {
		return c.String(http.StatusUnauthorized, "INTERNAL ERROR")
	}
	if !isInChat {
		return c.String(http.StatusUnauthorized, "NOT AUTHORIZED")
	}

	conn := db.GetDB()

	err = conn.DeleteFromGroupChat(
		context.Background(),
		queries.DeleteFromGroupChatParams{ChatID: chatID, Column2: req.UuidsToRemove})
	if err != nil {
		fmt.Println(err.Error())
		return c.String(http.StatusUnauthorized, "INTERNAL ERROR")
	}

	pusherEvents := pusher.MakePusherEventArray(pusher.USER_FEED_PREFIX, req.UuidsToRemove, "REMOVE_CHAT", nil)
	pusher.PusherClient.TriggerBatch(pusherEvents)

	return c.String(http.StatusOK, "SUCCESS")
}
