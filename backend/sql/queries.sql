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
-- name: CheckDuplicateFriendRequest :one
SELECT EXISTS(
        SELECT 1
        FROM friends
        WHERE reciever = $1
            AND sender = (
                SELECT uuid
                FROM users
                WHERE email = $2
            )
    );
-- name: CreateFriendRequest :one
INSERT INTO friends (sender, reciever, status)
VALUES (
        $1,
        (
            SELECT uuid
            FROM users
            WHERE email = $2
        ),
        'pending'
    )
RETURNING status;
-- name: GetUserContacts :many
SELECT u.username,
    u.uuid,
    u.picture_url
FROM friends
    JOIN users u ON u.uuid = friends.sender
    OR friends.reciever = u.uuid
WHERE (
        reciever = $1
        OR sender = $1
    )
    AND status = 'accepted'
    AND u.uuid != $1;
-- name: GetPendingFriendRequests :many
SELECT sender AS sender_id,
    u.username AS sender_username,
    u.picture_url AS sender_profile_picture,
    u.email AS sender_email
FROM friends
    JOIN users u ON friends.sender = u.uuid
WHERE reciever = $1
    AND status = 'pending';
-- name: AcceptFriendRequest :exec
UPDATE friends
SET status = 'accepted'
WHERE sender = $1
    AND reciever = $2;
-- name: DeclineFriendRequest :exec
DELETE FROM friends
WHERE sender = $1
    AND reciever = $2;
-- name: BlockFriendRequest :exec
UPDATE friends
SET status = 'blocked'
WHERE sender = $1
    AND reciever = $2;
-- name: BlockUser :exec
UPDATE friends
SET status = 'blocked'
WHERE (
        sender = $1
        AND reciever = $2
    )
    OR (
        sender = $2
        AND reciever = $1
    );
-- name: BlockChat :one
UPDATE chats
SET blocked = true
WHERE chat_id = $1
RETURNING blocked;
-- name: GetPendingContactRequests :many
SELECT u.email AS email,
    TO_CHAR(created_at, 'DD.MM.YYYY') AS date
FROM friends
    JOIN users u ON u.uuid = friends.reciever
WHERE sender = $1
    AND status = 'pending';