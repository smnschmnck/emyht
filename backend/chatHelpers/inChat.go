package chatHelpers

import (
	"chat/db"
	"context"
	"errors"
	"log"
	"sort"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

type LastChatMessage struct {
	SenderID       string  `json:"senderId"`
	SenderUsername string  `json:"senderUsername"`
	MessageType    string  `json:"messageType"`
	TextContent    *string `json:"textContent"`
	CreatedAt      string  `json:"createdAt"`
	DeliveryStatus string  `json:"deliveryStatus"`
	IsBlocked      bool    `json:"isBlocked"`
}

type Chat struct {
	ID             string           `json:"id"`
	ChatName       string           `json:"chatName"`
	ChatType       string           `json:"chatType"`
	CreatedAt      string           `json:"createdAt"`
	ChatPictureUrl string           `json:"chatPictureUrl"`
	UnreadMessages int              `json:"unreadMessages"`
	LastMessage    *LastChatMessage `json:"lastMessage"`
}

func getTimestamp(chat Chat) string {
	if chat.LastMessage != nil {
		return chat.LastMessage.CreatedAt
	}

	return chat.CreatedAt
}

func GetChatsByUUID(uuid pgtype.UUID) ([]Chat, error) {
	emptyResult := make([]Chat, 0)
	conn := db.GetDB()

	chats, err := conn.GetChatsForUser(context.Background(), uuid)
	if err != nil {
		log.Println(err)
		return emptyResult, errors.New("INTERNAL ERROR")
	}

	if chats == nil {
		return emptyResult, nil
	}

	lastGroupChatMessages, err := conn.GetLastGroupChatMessages(context.Background(), uuid)
	if err != nil {
		log.Println(err)
		return emptyResult, errors.New("INTERNAL ERROR")
	}
	lastOneOnOneChatMessages, err := conn.GetLastOneOnOneChatMessages(context.Background(), uuid)
	if err != nil {
		log.Println(err)
		return emptyResult, errors.New("INTERNAL ERROR")
	}

	lastMessageMap := make(map[string]LastChatMessage)

	for _, message := range lastGroupChatMessages {
		lastMessageMap[message.ChatID.String()] = LastChatMessage{
			SenderID:       message.SenderID.String(),
			SenderUsername: message.SenderUsername,
			MessageType:    string(message.MessageType),
			TextContent:    message.TextContent,
			CreatedAt:      message.CreatedAt.Time.Format(time.RFC3339),
			DeliveryStatus: string(message.DeliveryStatus),
			IsBlocked:      *message.Blocked,
		}
	}

	for _, message := range lastOneOnOneChatMessages {
		lastMessageMap[message.ChatID.String()] = LastChatMessage{
			SenderID:       message.SenderID.String(),
			SenderUsername: message.SenderUsername,
			MessageType:    string(message.MessageType),
			TextContent:    message.TextContent,
			CreatedAt:      message.CreatedAt.Time.Format(time.RFC3339),
			DeliveryStatus: string(message.DeliveryStatus),
			IsBlocked:      false,
		}
	}

	chatList := make([]Chat, 0)
	for _, chat := range chats {
		fullChat := Chat{
			ID:             chat.ID.String(),
			ChatName:       chat.ChatName,
			ChatType:       string(chat.ChatType),
			CreatedAt:      chat.CreatedAt.Time.Format(time.RFC3339),
			ChatPictureUrl: chat.ChatPictureUrl,
			UnreadMessages: int(chat.UnreadMessages),
			LastMessage:    nil,
		}

		lastMessage, ok := lastMessageMap[chat.ID.String()]
		if ok {
			fullChat.LastMessage = &lastMessage
		}

		chatList = append(chatList, fullChat)
	}

	sort.SliceStable(chatList, func(i, j int) bool {
		a := getTimestamp(chatList[i])
		b := getTimestamp(chatList[j])

		return a > b
	})

	return chatList, nil
}

func IsUserInChat(uuid pgtype.UUID, chatID pgtype.UUID) (bool, error) {
	chats, err := GetChatsByUUID(uuid)
	if err != nil {
		return false, err
	}
	for _, chat := range chats {
		if chat.ID == chatID.String() {
			return true, nil
		}
	}
	return false, nil
}
