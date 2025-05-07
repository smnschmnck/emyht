UPDATE chats
SET name = $1
WHERE chat_id = $2
    AND chat_type = "group"