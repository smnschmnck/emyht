package chatHelpers

import (
	"chat/db"
	"chat/queries"
	"context"
	"errors"
	"log"
	"sort"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
)

func getChatTimestamp(chat queries.GetChatsForUserRow) time.Time {
	if chat.MessageCreatedAt.Valid {
		return chat.MessageCreatedAt.Time
	}

	return chat.CreatedAt.Time
}

func GetChatsByUUID(uuid pgtype.UUID) ([]queries.GetChatsForUserRow, error) {
	conn := db.GetDB()

	chats, err := conn.GetChatsForUser(context.Background(), uuid)
	if err != nil {
		log.Println(err)
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

func IsUserInChat(uuid pgtype.UUID, chatID pgtype.UUID) (bool, error) {
	chats, err := GetChatsByUUID(uuid)
	if err != nil {
		return false, err
	}
	for _, chat := range chats {
		if chat.ID.String() == chatID.String() {
			return true, nil
		}
	}
	return false, nil
}
