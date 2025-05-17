-- Add pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Enums
CREATE TYPE chat_type AS ENUM ('group', 'one_on_one');
CREATE TYPE message_type AS ENUM ('plaintext', 'image', 'video', 'audio', 'data');
CREATE TYPE delivery_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted');
-- Tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(64) NOT NULL UNIQUE,
    username VARCHAR(32) NOT NULL,
    password VARCHAR(256) NOT NULL,
    salt VARCHAR(128) NOT NULL,
    is_admin BOOLEAN NOT NULL,
    email_active BOOLEAN NOT NULL,
    email_token VARCHAR(64) UNIQUE,
    picture_url VARCHAR(128) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_token ON users(email_token);
CREATE INDEX idx_users_username ON users(username);
CREATE TABLE change_email (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    new_email VARCHAR(64) NOT NULL UNIQUE,
    confirmation_token VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_change_email_user_id ON change_email(user_id);
CREATE INDEX idx_change_email_confirmation_token ON change_email(confirmation_token);
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(32) NOT NULL,
    last_message_id UUID,
    picture_url VARCHAR(128) NOT NULL,
    chat_type chat_type NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_chats_chat_type ON chats(chat_type);
CREATE INDEX idx_chats_last_message_id ON chats(last_message_id);
CREATE TABLE chatmessages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES chats(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    text_content VARCHAR(4096),
    message_type message_type NOT NULL,
    media_url VARCHAR(512),
    delivery_status delivery_status NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- Add foreign key constraint for last_message_id after chatmessages table is created
ALTER TABLE chats
ADD CONSTRAINT fk_last_message FOREIGN KEY (last_message_id) REFERENCES chatmessages(id);
CREATE INDEX idx_chatmessages_chat_id ON chatmessages(chat_id);
CREATE INDEX idx_chatmessages_sender_id ON chatmessages(sender_id);
CREATE INDEX idx_chatmessages_created_at ON chatmessages(created_at);
CREATE INDEX idx_chatmessages_chat_created ON chatmessages(chat_id, created_at);
CREATE TABLE user_chat (
    user_id UUID NOT NULL REFERENCES users(id),
    chat_id UUID NOT NULL REFERENCES chats(id),
    unread_messages BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, chat_id)
);
CREATE INDEX idx_user_chat_chat_id ON user_chat(chat_id);
CREATE INDEX idx_user_chat_user_id ON user_chat(user_id);
CREATE INDEX idx_user_chat_combined ON user_chat(chat_id, user_id);
CREATE TABLE friends (
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    status friendship_status NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sender_id, receiver_id)
);
CREATE INDEX idx_friends_sender_id ON friends(sender_id);
CREATE INDEX idx_friends_receiver_id ON friends(receiver_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friends_sender_status ON friends(sender_id, status);
CREATE INDEX idx_friends_receiver_status ON friends(receiver_id, status);
CREATE TABLE user_blocks (
    blocker_id UUID NOT NULL,
    blocked_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (blocker_id, blocked_id),
    FOREIGN KEY (blocker_id) REFERENCES users(id),
    FOREIGN KEY (blocked_id) REFERENCES users(id),
    CONSTRAINT no_self_blocking CHECK (blocker_id != blocked_id)
);