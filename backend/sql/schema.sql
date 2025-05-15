-- Add pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;
-- Enums
CREATE TYPE chat_type AS ENUM ('group', 'one_on_one');
CREATE TYPE message_type AS ENUM ('plaintext', 'image', 'video', 'audio', 'data');
CREATE TYPE delivery_status AS ENUM ('sent', 'delivered', 'read');
CREATE TYPE friendship_status AS ENUM ('pending', 'accepted', 'declined', 'blocked');
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
CREATE TABLE change_email (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    new_email VARCHAR(64) NOT NULL UNIQUE,
    confirmation_token VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(32) NOT NULL,
    last_message_id UUID,
    picture_url VARCHAR(128) NOT NULL,
    chat_type chat_type NOT NULL,
    blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
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
CREATE TABLE user_chat (
    user_id UUID NOT NULL REFERENCES users(id),
    chat_id UUID NOT NULL REFERENCES chats(id),
    unread_messages BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, chat_id)
);
CREATE TABLE friends (
    sender_id UUID NOT NULL REFERENCES users(id),
    receiver_id UUID NOT NULL REFERENCES users(id),
    status friendship_status NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (sender_id, receiver_id)
);