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

interface ChatsProps {
  chats: ISingleChat[];
  openChat: (
    curChatID: string,
    profilePictureUrl: string,
    chatName: string
  ) => void;
  addChatButtonClickHandler: () => void;
}

const Chats: React.FC<ChatsProps> = ({
  chats,
  openChat,
  addChatButtonClickHandler,
}) => {
  const [filteredChats, setFilteredChats] = useState(chats);
  const filterChats = (query: string) => {
    const lowerCaseQuery = query.toLowerCase();
    setFilteredChats(
      chats.filter((c) => {
        const lowerCaseChat = c.name.toLowerCase();
        return lowerCaseChat.includes(lowerCaseQuery);
      })
    );
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
                    <span className={styles.popupOptionText}> Add chat</span>
                  </div>
                </button>
                <button className={styles.popupOption}>
                  {' '}
                  <div className={styles.popupOptionContent}>
                    <Image src={addUser} alt=""></Image>
                    <span className={styles.popupOptionText}> Add contact</span>
                  </div>
                </button>
              </div>
            </PopupButton>
          </div>
          <Input
            placeholder="Search Chats"
            onChange={(e) => filterChats(e.target.value)}
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
        {filteredChats.map((chat) => (
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
      </div>
    </div>
  );
};

export default Chats;
