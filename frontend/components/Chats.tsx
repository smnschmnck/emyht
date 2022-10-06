import styles from '../styles/ChatsComponent.module.css';
import plus from '../assets/images/plus.svg';
import chat from '../assets/images/chat.svg';
import addUser from '../assets/images/addUser.svg';
import { Input } from './atomic/Input';
import Image from 'next/image';
import SingleChat from './SingleChat';
import ISingleChat from '../interfaces/ISingleChat';
import { useState } from 'react';
import { PopupButton } from './atomic/PopupButton';
import { BigButton } from './atomic/Button';
import { useQuery } from '@tanstack/react-query';

export interface ContactRequest {
  senderID: string;
  senderUsername: string;
  senderProfilePicture?: string;
}

interface ChatsProps {
  openChat: (chatID: string) => void;
  addChatButtonClickHandler: () => void;
  sendFriendRequestButtonClickHandler: () => void;
  setShowAddChatModal: (show: boolean) => void;
}

const Chats: React.FC<ChatsProps> = ({
  openChat,
  addChatButtonClickHandler,
  sendFriendRequestButtonClickHandler,
  setShowAddChatModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { data } = useQuery<ISingleChat[]>(['chats'], async () => {
    const res = await fetch('/api/getChats');
    return (await res.json()) as ISingleChat[];
  });
  const chats = data ?? [];

  const getFilteredChats = () => {
    return chats.filter((chat) => {
      const lowerChatName = chat.chatName.toLowerCase();
      const lowerChatQuery = searchQuery.toLowerCase();
      return lowerChatName.includes(lowerChatQuery);
    });
  };

  return (
    <div className={styles.chatWrapper}>
      <div className={styles.controls}>
        <div className={styles.chatContainer}>
          <div className={styles.chatsHeader}>
            <h2 className={styles.chatsHeading}>Chats</h2>
            <PopupButton buttonClassName={styles.addChatButton} icon={plus}>
              <div className={styles.popupContent}>
                <button
                  className={styles.popupOption}
                  onClick={() => {
                    addChatButtonClickHandler();
                  }}
                >
                  <div className={styles.popupOptionContent}>
                    <Image src={chat} alt=""></Image>
                    <span className={styles.popupOptionText}>Add chat</span>
                  </div>
                </button>
                <button
                  className={styles.popupOption}
                  onClick={() => sendFriendRequestButtonClickHandler()}
                >
                  <div className={styles.popupOptionContent}>
                    <Image src={addUser} alt=""></Image>
                    <span className={styles.popupOptionText}>Add contact</span>
                  </div>
                </button>
              </div>
            </PopupButton>
          </div>
          <Input
            placeholder="Search Chats"
            onChange={(e) => setSearchQuery(e.target.value)}
          ></Input>
        </div>
      </div>
      <div className={styles.chats}>
        {chats.length <= 0 && (
          //TODO make message more beautiful
          <div>
            <h2>Looks empty in here</h2>
            <BigButton onClick={() => setShowAddChatModal(true)}>
              Start a new chat
            </BigButton>
          </div>
        )}
        {getFilteredChats().map((chat) => (
          <SingleChat
            key={chat.chatID}
            creationTimestamp={chat.creationTimestamp}
            chatID={chat.chatID}
            chatType={chat.chatType}
            chatName={chat.chatName}
            timestamp={chat.timestamp}
            textContent={chat.textContent}
            unreadMessages={chat.unreadMessages}
            deliveryStatus={chat.deliveryStatus}
            senderID={chat.senderID}
            pictureUrl={chat.pictureUrl}
            openChat={openChat}
            senderUsername={chat.senderUsername}
            messageType={chat.messageType}
          />
        ))}
        {chats.length > 0 && getFilteredChats().length <= 0 && (
          <h2 className={styles.noMatch}>No chat matching your search 👓</h2>
        )}
      </div>
    </div>
  );
};

export default Chats;
