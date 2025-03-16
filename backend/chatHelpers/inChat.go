package chatHelpers

import (
	"chat/db"
	"chat/queries"
	"context"
	"errors"
	"fmt"
	"sort"
)

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
		var a int
		var b int
		c1 := chats[i]
		c2 := chats[j]
		t1 := c1.Timestamp
		t2 := c2.Timestamp
		if t1 != nil {
			a = int(*t1)
		} else {
			a = int(c1.CreationTimestamp)
		}
		if t2 != nil {
			b = int(*t2)
		} else {
			b = int(c2.CreationTimestamp)
		}
		return a > b
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
