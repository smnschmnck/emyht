create type chat_type as enum ('group', 'one_on_one');
create type message_type as enum ('plaintext', 'image', 'video', 'audio', 'data');
create type delivery_status as enum ('sent', 'delivered', 'read');
create type friendship_status as enum ('pending', 'accepted', 'declined', 'blocked');
create table users (
    uuid varchar(64) not null primary key,
    email varchar(64) not null unique,
    username varchar(32) not null,
    password varchar(256) not null,
    salt varchar(128) not null,
    is_admin boolean not null,
    email_active boolean not null,
    email_token varchar(64) unique,
    picture_url varchar(128) not null,
    created_at timestamp default CURRENT_TIMESTAMP
);
create table change_email (
    uuid varchar(64) not null unique references users,
    new_email varchar(64) not null unique,
    confirmation_token varchar(64) not null unique,
    created_at timestamp default CURRENT_TIMESTAMP
);
create table chats (
    chat_id varchar(64) not null primary key,
    name varchar(32) not null,
    last_message_id varchar(64),
    picture_url varchar(128) not null,
    chat_type chat_type not null,
    blocked boolean default false,
    created_at timestamp default CURRENT_TIMESTAMP
);
create table chatmessages (
    message_id varchar(64) not null primary key,
    chat_id varchar(64) not null references chats,
    sender_id varchar(64) not null references users,
    text_content varchar(4096),
    message_type message_type not null,
    media_url varchar(512),
    delivery_status delivery_status not null,
    created_at timestamp default CURRENT_TIMESTAMP
);
create table user_chat (
    uuid varchar(64) not null references users,
    chat_id varchar(64) not null references chats,
    unread_messages bigint not null,
    created_at timestamp default CURRENT_TIMESTAMP,
    primary key (uuid, chat_id)
);
create table friends (
    sender varchar(64) not null references users,
    reciever varchar(64) not null references users,
    status friendship_status not null,
    created_at timestamp default CURRENT_TIMESTAMP,
    primary key (sender, reciever)
);