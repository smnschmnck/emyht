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
INSERT INTO change_email (user_id, new_email, confirmation_token)
VALUES ($1, $2, $3) ON CONFLICT (user_id) DO
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
WHERE u.user_id = (
        SELECT c.user_id
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
WHERE id = $2
RETURNING username;
-- name: GetChatsForUser :many
SELECT DISTINCT c.id,
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
    JOIN chats c ON u.chat_id = c.id
    LEFT JOIN chatmessages m ON m.id = c.last_message_id -- Only join for one_on_one chats
    LEFT JOIN user_chat ouc ON c.id = ouc.chat_id
    AND ouc.user_id != $1
    AND c.chat_type = 'one_on_one'
    LEFT JOIN users ou ON ouc.user_id = ou.id
    LEFT JOIN users su ON m.sender_id = su.id
WHERE u.user_id = $1;
-- name: CheckDuplicateFriendRequest :one
SELECT EXISTS(
        SELECT 1
        FROM friends
        WHERE receiver_id = $1
            AND sender_id = (
                SELECT id
                FROM users
                WHERE email = $2
            )
    );
-- name: CreateFriendRequest :one
INSERT INTO friends (sender_id, receiver_id, status)
VALUES (
        $1,
        (
            SELECT id
            FROM users
            WHERE email = $2
        ),
        'pending'
    )
RETURNING status;
-- name: GetUserContacts :many
SELECT u.username,
    u.id,
    u.picture_url
FROM friends
    JOIN users u ON u.id = friends.sender_id
    OR friends.receiver_id = u.id
    LEFT JOIN user_blocks ub ON ub.blocker_id = $1
    AND ub.blocked_id = u.id
WHERE (
        receiver_id = $1
        OR sender_id = $1
    )
    AND status = 'accepted'
    AND u.id != $1
    AND ub.blocker_id IS NULL;
-- name: GetPendingFriendRequests :many
SELECT sender_id,
    u.username AS sender_username,
    u.picture_url AS sender_profile_picture,
    u.email AS sender_email
FROM friends
    JOIN users u ON sender_id = u.id
    LEFT JOIN user_blocks ub ON sender_id = ub.blocked_id -- Assuming blocked_id is the ID of the person who was blocked
WHERE receiver_id = $1
    AND status = 'pending'
    AND ub.blocked_id IS NULL;
-- name: GetSentContactRequests :many
SELECT u.email AS email,
    friends.created_at
FROM friends
    JOIN users u ON u.id = friends.receiver_id
WHERE sender_id = $1
    AND status = 'pending';
-- name: AcceptFriendRequest :exec
UPDATE friends
SET status = 'accepted'
WHERE sender_id = $1
    AND receiver_id = $2;
-- name: DeclineFriendRequest :exec
DELETE FROM friends
WHERE sender_id = $1
    AND receiver_id = $2;
-- name: BlockUser :exec
INSERT INTO user_blocks (blocker_id, blocked_id)
VALUES ($1, $2) ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
-- name: UnblockUser :exec
DELETE FROM user_blocks
WHERE blocker_id = $1
    AND blocked_id = $2;
-- name: CheckChatExists :one
SELECT count(user_chat.chat_id) >= 2 AS chatcount
FROM user_chat
    JOIN chats c ON user_chat.chat_id = c.id
WHERE chat_type = 'one_on_one'
    AND (
        user_id = $1
        OR user_id = $2
    )
GROUP BY c.id
ORDER BY chatcount DESC
LIMIT 1;
-- name: CreateOneOnOneChat :one
INSERT INTO chats (
        name,
        picture_url,
        chat_type
    )
VALUES ('', '', 'one_on_one')
RETURNING id;
-- name: InsertUserChat :one
INSERT INTO user_chat (user_id, chat_id, unread_messages)
VALUES ($1, $2, 0)
RETURNING chat_id;
-- name: InsertParticipantChat :one
INSERT INTO user_chat (user_id, chat_id, unread_messages)
VALUES ($1, $2, 0)
RETURNING chat_id;
-- name: CreateGroupChat :one
INSERT INTO chats (
        name,
        picture_url,
        chat_type
    )
VALUES ($1, $2, 'group')
RETURNING id;
-- name: ValidateChatID :one
SELECT id
FROM chats
WHERE id = $1;
-- name: GetChatType :one
SELECT chat_type
FROM chats
WHERE id = $1;
-- name: CreateChatMessage :one
INSERT INTO chatmessages (
        chat_id,
        sender_id,
        text_content,
        message_type,
        media_url,
        delivery_status
    )
VALUES ($1, $2, $3, $4, $5, 'sent')
RETURNING id;
-- name: UpdateLastMessageID :one
UPDATE chats
SET last_message_id = $1
WHERE id = $2
RETURNING id;
-- name: IncrementUnreadMessages :one
UPDATE user_chat
SET unread_messages = (unread_messages + 1)
WHERE chat_id = $1
    AND user_id != $2
RETURNING true;
-- name: GetChatMessages :many
SELECT chatmessages.id,
    sender_id,
    username AS sender_username,
    text_content,
    message_type,
    media_url,
    chatmessages.created_at,
    delivery_status
FROM chatmessages
    JOIN users u ON u.id = chatmessages.sender_id
WHERE chat_id = $1
ORDER BY chatmessages.created_at ASC;
-- name: ResetUnreadMessages :exec
UPDATE user_chat
SET unread_messages = 0
WHERE chat_id = $1
    AND user_id = $2;
-- name: GetChatMembers :many
SELECT users.id,
    picture_url,
    username
FROM user_chat
    JOIN users ON users.id = user_chat.user_id
WHERE chat_id = $1;
-- name: IsGroupChat :one
SELECT chat_type = 'group'
FROM chats
WHERE id = $1;
-- name: GetGroupChatUserCount :one
SELECT count(user_id)
FROM user_chat
WHERE chat_id = $1
GROUP BY chat_id;
-- name: LeaveGroupChat :exec
DELETE FROM user_chat
WHERE chat_id = $1
    AND user_id = $2;
-- name: GetAvailableGroupChats :many
SELECT c.id,
    c.name AS chat_name,
    c.picture_url
FROM user_chat uc
    JOIN chats c ON c.id = uc.chat_id
WHERE uc.user_id = $1
    AND c.chat_type = 'group'
EXCEPT
SELECT c.id,
    c.name AS chat_name,
    c.picture_url
FROM user_chat uc
    JOIN chats c ON c.id = uc.chat_id
WHERE uc.user_id = $2
    AND c.chat_type = 'group';
-- name: GetOneOnOneChatParticipant :one
SELECT user_id
FROM user_chat
WHERE chat_id = $1
    AND user_id != $2;
-- name: GetUserByUUID :one
SELECT id,
    email,
    username,
    password,
    salt,
    is_admin,
    email_active,
    picture_url
FROM users
WHERE id = $1;
-- name: GetUserByEmail :one
SELECT id,
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
        email,
        username,
        password,
        salt,
        is_admin,
        email_active,
        email_token,
        picture_url
    )
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING id,
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
WHERE id = $2;
-- name: DeleteFromGroupChat :exec
DELETE FROM user_chat
WHERE chat_id = $1
    AND user_id = ANY($2::UUID []);
-- name: ChangeGroupName :exec
UPDATE chats
SET name = $1
WHERE id = $2
    AND chat_type = 'group';
-- name: ChangeGroupPicture :exec
UPDATE chats
SET picture_url = $1
WHERE chat_type = 'group'
    AND id = $2;
-- name: GetIsChatBlocked :one
SELECT EXISTS (
        SELECT 1
        FROM user_blocks ub
            JOIN user_chat uc ON ub.blocked_id = uc.user_id
            JOIN chats c ON c.id = $2
        WHERE ub.blocker_id = $1
            AND uc.chat_id = $2
            AND c.chat_type = 'one_on_one'
    );
-- name: GetUsersWhoBlockedUser :many
SELECT blocker_id
FROM user_blocks
WHERE blocked_id = $1;
-- name: GetBlockedUsers :many
SELECT blocked_id
FROM user_blocks
WHERE blocker_id = $1;