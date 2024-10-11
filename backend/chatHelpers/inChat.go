package chatHelpers

import (
	"chat/dbHelpers/postgresHelper"
	"context"
	"errors"
	"fmt"
	"sort"

	"github.com/georgysavva/scany/pgxscan"
	"github.com/jackc/pgx/v4/pgxpool"
)

type SingleChat struct {
	ChatID            string  `json:"chatID"`
	ChatType          string  `json:"chatType"`
	CreationTimestamp int     `json:"creationTimestamp"`
	Name              string  `json:"chatName"`
	PictureUrl        string  `json:"pictureUrl"`
	UnreadMessages    int     `json:"unreadMessages"`
	MessageType       *string `json:"messageType"`
	TextContent       *string `json:"textContent"`
	Timestamp         *int    `json:"timestamp"`
	DeliveryStatus    *string `json:"deliveryStatus"`
	SenderID          *string `json:"senderID"`
	SenderUsername    *string `json:"senderUsername"`
}

func GetChatsByUUID(uuid string) ([]SingleChat, error) {
	ctx := context.Background()
	conn, err := pgxpool.Connect(ctx, postgresHelper.PGConnString)
	if err != nil {
		return []SingleChat{}, errors.New("INTERNAL ERROR")
	}
	defer conn.Close()

	getChatsQuery := "SELECT c.chat_id, " +
		"c.chat_type, " +
		"c.creation_timestamp, " +
		"(CASE c.chat_type " +
		"WHEN 'one_on_one' THEN (SELECT users.username AS name " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"WHERE c.chat_id = uc.chat_id " +
		"AND uc.uuid != $1) " +
		"ELSE c.name END " +
		"), " +
		"( " +
		"CASE c.chat_type " +
		"WHEN 'one_on_one' THEN (SELECT users.picture_url AS picture_url " +
		"FROM users " +
		"JOIN user_chat uc on users.uuid = uc.uuid " +
		"WHERE c.chat_id = uc.chat_id " +
		"AND uc.uuid != $1) " +
		"ELSE c.picture_url END " +
		"), " +
		"u.unread_messages, " +
		"m.message_type, " +
		"m.text_content, " +
		"m.timestamp, " +
		"m.delivery_status, " +
		"m.sender_id, " +
		"(SELECT username AS sender_username FROM users WHERE users.uuid = m.sender_id) " +
		"FROM user_chat u " +
		"JOIN chats c ON u.chat_id = c.chat_id " +
		"LEFT JOIN chatmessages m ON m.message_id = c.last_message_id " +
		"WHERE u.uuid = $1"
	var chats []SingleChat
	err = pgxscan.Select(ctx, conn, &chats, getChatsQuery, uuid)
	if err != nil {
		fmt.Println(err)
		return []SingleChat{}, errors.New("INTERNAL ERROR")
	}

	if chats == nil {
		return make([]SingleChat, 0), nil
	}

	sort.SliceStable(chats, func(i, j int) bool {
		var a int
		var b int
		c1 := chats[i]
		c2 := chats[j]
		t1 := c1.Timestamp
		t2 := c2.Timestamp
		if t1 != nil {
			a = *t1
		} else {
			a = c1.CreationTimestamp
		}
		if t2 != nil {
			b = *t2
		} else {
			b = c2.CreationTimestamp
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
