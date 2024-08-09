create type chat_type as enum ('group', 'one_on_one');
alter type chat_type owner to postgres;
create type message_type as enum ('plaintext', 'image', 'video', 'audio', 'data');
alter type message_type owner to postgres;
create type delivery_status as enum ('sent', 'delivered', 'read');
alter type delivery_status owner to postgres;
create type friendship_status as enum ('pending', 'accepted', 'declined', 'blocked');
alter type friendship_status owner to postgres;
create table users (
    uuid varchar(64) not null primary key,
    email varchar(64) not null unique,
    username varchar(32) not null,
    password varchar(256) not null,
    salt varchar(128) not null,
    is_admin boolean not null,
    email_active boolean not null,
    email_token varchar(64) unique,
    picture_url varchar(128) not null
);
alter table users owner to postgres;
create table change_email (
    uuid varchar(64) not null unique references users,
    new_email varchar(64) not null unique,
    confirmation_token varchar(64) not null unique
);
alter table change_email owner to postgres;
create table chats (
    chat_id varchar(64) not null primary key,
    name varchar(32) not null,
    last_message_id varchar(64),
    picture_url varchar(128) not null,
    chat_type chat_type not null,
    creation_timestamp bigint not null,
    blocked boolean default false
);
alter table chats owner to postgres;
create table chatmessages (
    message_id varchar(64) not null primary key,
    chat_id varchar(64) not null references chats,
    sender_id varchar(64) not null references users,
    text_content varchar(4096),
    message_type message_type not null,
    media_url varchar(128),
    timestamp bigint not null,
    delivery_status delivery_status not null
);
alter table chatmessages owner to postgres;
create table user_chat (
    uuid varchar(64) not null references users,
    chat_id varchar(64) not null references chats,
    unread_messages bigint not null,
    primary key (uuid, chat_id)
);
alter table user_chat owner to postgres;
create table friends (
    sender varchar(64) not null references users,
    reciever varchar(64) not null references users,
    status friendship_status not null,
    created_at timestamp default CURRENT_TIMESTAMP,
    primary key (sender, reciever)
);
alter table friends owner to postgres;
create user consumer with password '7vSpeK4iCFQwayuCPr7s93LNbWc5oxf3';
grant delete,
    insert,
    select,
    update on users to consumer;
grant delete,
    insert,
    select,
    update on change_email to consumer;
grant delete,
    insert,
    select,
    update on chats to consumer;
grant delete,
    insert,
    select,
    update on chatmessages to consumer;
grant delete,
    insert,
    select,
    update on user_chat to consumer;
grant delete,
    insert,
    select,
    update on friends to consumer;