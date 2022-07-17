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
import { ContactRequests } from './ContactRequests';

export interface ContactRequest {
  senderID: string;
  senderUsername: string;
  senderProfilePicture: string;
}

interface ChatsProps {
  chats: ISingleChat[];
  contactRequests: ContactRequest[];
  openChat: (
    curChatID: string,
    profilePictureUrl: string,
    chatName: string
  ) => void;
  addChatButtonClickHandler: () => void;
  sendFriendRequestButtonClickHandler: () => void;
}

const Chats: React.FC<ChatsProps> = ({
  chats,
  contactRequests,
  openChat,
  addChatButtonClickHandler,
  sendFriendRequestButtonClickHandler,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const getFilteredChats = () => {
    return chats.filter((chat) => {
      const lowerChatName = chat.name.toLowerCase();
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
            <p>Start a new chat</p>
          </div>
        )}
        {getFilteredChats().map((chat) => (
          <SingleChat
            key={chat.chatID}
            chatID={chat.chatID}
            name={chat.name}
            time={chat.time}
            lastMessage={chat.lastMessage}
            unreadMessagesCount={chat.unreadMessagesCount}
            deliveryStatus={chat.deliveryStatus}
            read={chat.read}
            ownMessage={chat.ownMessage}
            profilePictureUrl={chat.profilePictureUrl}
            openChat={openChat}
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
