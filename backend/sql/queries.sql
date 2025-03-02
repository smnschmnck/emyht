-- name: GetEmailActiveByToken :one
SELECT email_active
FROM users
WHERE email_token = $1;
-- name: ActivateEmail :one
UPDATE users
SET email_active = true,
    email_token = $1
WHERE email_token = $2
RETURNING email_active;
-- name: EmailExists :one
SELECT count(1) > 0
FROM users
WHERE email = $1;
-- name: UpsertChangeEmail :one
INSERT INTO change_email (uuid, new_email, confirmation_token)
VALUES ($1, $2, $3) ON CONFLICT (uuid) DO
UPDATE
SET new_email = $2,
    confirmation_token = $3
RETURNING confirmation_token,
    new_email;
-- name: UpdateEmailFromChangeEmail :one
UPDATE users u
SET email_active = true,
    email_token = $1,
    email = (
        SELECT c.new_email
        FROM change_email c
        WHERE c.confirmation_token = $2
    )
WHERE u.uuid = (
        SELECT c.uuid
        FROM change_email c
        WHERE c.confirmation_token = $2
    )
RETURNING u.email;
-- name: DeleteChangeEmail :exec
DELETE FROM change_email
WHERE confirmation_token = $1;
-- name: UpdateUsername :one
UPDATE users
SET username = $1
WHERE uuid = $2
RETURNING username;
-- name: GetChatsForUser :many
SELECT c.chat_id,
    c.chat_type,
    c.creation_timestamp,
    CASE
        WHEN c.chat_type = 'one_on_one' THEN ou.username::TEXT
        ELSE c.name::TEXT
    END AS chat_name,
    CASE
        WHEN c.chat_type = 'one_on_one' THEN ou.picture_url::TEXT
        ELSE c.picture_url::TEXT
    END AS chat_picture_url,
    u.unread_messages,
    m.message_type,
    m.text_content,
    m.timestamp,
    m.delivery_status,
    m.sender_id,
    su.username AS sender_username
FROM user_chat u
    JOIN chats c ON u.chat_id = c.chat_id
    LEFT JOIN chatmessages m ON m.message_id = c.last_message_id
    LEFT JOIN user_chat ouc ON c.chat_id = ouc.chat_id
    AND ouc.uuid != $1 -- Other User in Chat
    LEFT JOIN users ou ON ouc.uuid = ou.uuid -- Other User Details
    LEFT JOIN users su ON m.sender_id = su.uuid -- Sender User Details
WHERE u.uuid = $1;