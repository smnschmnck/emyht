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
SELECT DISTINCT c.chat_id,
    c.chat_type,
    c.created_at,
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
    m.created_at as message_created_at,
    m.delivery_status,
    m.sender_id,
    su.username AS sender_username
FROM user_chat u
    JOIN chats c ON u.chat_id = c.chat_id
    LEFT JOIN chatmessages m ON m.message_id = c.last_message_id -- Only join for one_on_one chats
    LEFT JOIN user_chat ouc ON c.chat_id = ouc.chat_id
    AND ouc.uuid != $1
    AND c.chat_type = 'one_on_one'
    LEFT JOIN users ou ON ouc.uuid = ou.uuid
    LEFT JOIN users su ON m.sender_id = su.uuid
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
    friends.created_at
FROM friends
    JOIN users u ON u.uuid = friends.reciever
WHERE sender = $1
    AND status = 'pending';
-- name: CheckChatExists :one
SELECT count(user_chat.chat_id) >= 2 AS chatcount
FROM user_chat
    JOIN chats c ON user_chat.chat_id = c.chat_id
WHERE chat_type = 'one_on_one'
    AND (
        uuid = $1
        OR uuid = $2
    )
GROUP BY c.chat_id
ORDER BY chatcount DESC
LIMIT 1;
-- name: CreateOneOnOneChat :one
INSERT INTO chats (
        chat_id,
        name,
        picture_url,
        chat_type
    )
VALUES ($1, '', '', 'one_on_one')
RETURNING chat_id;
-- name: InsertUserChat :one
INSERT INTO user_chat (uuid, chat_id, unread_messages)
VALUES ($1, $2, 0)
RETURNING chat_id;
-- name: InsertParticipantChat :one
INSERT INTO user_chat (uuid, chat_id, unread_messages)
VALUES ($1, $2, 0)
RETURNING chat_id;
-- name: CreateGroupChat :one
INSERT INTO chats (
        chat_id,
        name,
        picture_url,
        chat_type
    )
VALUES ($1, $2, $3, 'group')
RETURNING chat_id;
-- name: ValidateChatID :one
SELECT chat_id
FROM chats
WHERE chat_id = $1;
-- name: GetChatType :one
SELECT chat_type
FROM chats
WHERE chat_id = $1;
-- name: CreateChatMessage :one
INSERT INTO chatmessages (
        message_id,
        chat_id,
        sender_id,
        text_content,
        message_type,
        media_url,
        delivery_status
    )
VALUES ($1, $2, $3, $4, $5, $6, 'sent')
RETURNING message_id;
-- name: UpdateLastMessageID :one
UPDATE chats
SET last_message_id = $1
WHERE chat_id = $2
RETURNING chat_id;
-- name: IncrementUnreadMessages :one
UPDATE user_chat
SET unread_messages = (unread_messages + 1)
WHERE chat_id = $1
    AND uuid != $2
RETURNING true;
-- name: GetChatMessages :many
SELECT message_id,
    sender_id,
    username AS sender_username,
    text_content,
    message_type,
    media_url,
    chatmessages.created_at,
    delivery_status
FROM chatmessages
    JOIN users u ON u.uuid = chatmessages.sender_id
WHERE chat_id = $1
ORDER BY chatmessages.created_at ASC;
-- name: ResetUnreadMessages :exec
UPDATE user_chat
SET unread_messages = 0
WHERE chat_id = $1
    AND uuid = $2;
-- name: GetChatMembers :many
SELECT users.uuid,
    picture_url,
    username
FROM user_chat
    JOIN users ON users.uuid = user_chat.uuid
WHERE chat_id = $1;
-- name: IsGroupChat :one
SELECT chat_type = 'group'
FROM chats
WHERE chat_id = $1;
-- name: GetGroupChatUserCount :one
SELECT count(uuid)
FROM user_chat
WHERE chat_id = $1
GROUP BY chat_id;
-- name: LeaveGroupChat :exec
DELETE FROM user_chat
WHERE chat_id = $1
    AND uuid = $2;
-- name: GetAvailableGroupChats :many
SELECT c.chat_id,
    c.name AS chat_name,
    c.picture_url
FROM user_chat uc
    JOIN chats c ON c.chat_id = uc.chat_id
WHERE uc.uuid = $1
    AND c.chat_type = 'group'
EXCEPT
SELECT c.chat_id,
    c.name AS chat_name,
    c.picture_url
FROM user_chat uc
    JOIN chats c ON c.chat_id = uc.chat_id
WHERE uc.uuid = $2
    AND c.chat_type = 'group';
-- name: GetOneOnOneChatParticipant :one
SELECT uuid
FROM user_chat
WHERE chat_id = $1
    AND uuid != $2;
-- name: GetUserByUUID :one
SELECT uuid,
    email,
    username,
    password,
    salt,
    is_admin,
    email_active,
    picture_url
FROM users
WHERE uuid = $1;
-- name: GetUserByEmail :one
SELECT uuid,
    email,
    username,
    password,
    salt,
    is_admin,
    email_active
FROM users
WHERE email = $1;
-- name: CreateUser :one
INSERT INTO users (
        uuid,
        email,
        username,
        password,
        salt,
        is_admin,
        email_active,
        email_token,
        picture_url
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING uuid,
    email,
    username,
    password,
    salt,
    is_admin,
    email_active,
    email_token,
    picture_url;
-- name: UpdateEmailToken :one
UPDATE users
SET email_token = $1
WHERE email = $2
RETURNING email_token;
-- name: UpdatePictureURL :exec
UPDATE users
SET picture_url = $1
WHERE uuid = $2;
-- name: DeleteFromGroupChat :exec
DELETE FROM user_chat
WHERE chat_id = $1
    AND uuid = ANY($2::varchar(64) []);
-- name: ChangeGroupName :exec
UPDATE chats
SET name = $1
WHERE chat_id = $2
    AND chat_type = 'group';
-- name: ChangeGroupPicture :exec
UPDATE chats
SET picture_url = $1
WHERE chat_type = 'group'
    AND chat_id = $2;