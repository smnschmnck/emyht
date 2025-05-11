package chatHelpers

import (
	"chat/db"
	"chat/queries"
	"context"
	"errors"
	"fmt"
	"sort"
	"time"
)

func getChatTimestamp(chat queries.GetChatsForUserRow) time.Time {
	if chat.MessageCreatedAt.Valid {
		return chat.MessageCreatedAt.Time
	}

	return chat.CreatedAt.Time
}

func GetChatsByUUID(uuid string) ([]queries.GetChatsForUserRow, error) {
	conn := db.GetDB()

	chats, err := conn.GetChatsForUser(context.Background(), uuid)
	if err != nil {
		fmt.Println(err)
		return []queries.GetChatsForUserRow{}, errors.New("INTERNAL ERROR")
	}

	if chats == nil {
		return make([]queries.GetChatsForUserRow, 0), nil
	}

	sort.SliceStable(chats, func(i, j int) bool {
		a := getChatTimestamp(chats[i])
		b := getChatTimestamp(chats[j])

		return (a.After(b))
	})

	return chats, nil
}

func IsUserInChat(uuid string, chatID string) (bool, error) {
	chats, err := GetChatsByUUID(uuid)
	if err != nil {
		return false, err
	}
	for _, chat := range chats {
		if chat.ChatID == chatID {
			return true, nil
		}
	}
	return false, nil
}
