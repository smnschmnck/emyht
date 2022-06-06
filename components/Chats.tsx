import styles from '../styles/ChatsComponent.module.css';
import plus from '../assets/images/plus.svg';
import { Input } from './atomic/Input';
import Image from 'next/image';
import SingleChat from './SingleChat';
import ISingleChat from '../interfaces/ISingleChat';
import { useState } from 'react';

interface ISingleChatWithChatID extends ISingleChat {
  chatID: string;
}

interface ChatsProps {
  chats: ISingleChatWithChatID[];
}

const Chats: React.FC<ChatsProps> = ({ chats }) => {
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
            <button className={styles.addChatButton} title="Add new Chat">
              <Image src={plus} alt="Add Chat" />
            </button>
          </div>
          <Input
            placeholder="Search Chats"
            onChange={(e) => filterChats(e.target.value)}
          ></Input>
        </div>
      </div>
      <div className={styles.chats}>
        {filteredChats.map((chat) => (
          <SingleChat
            key={chat.chatID}
            name={chat.name}
            time={chat.time}
            lastMessage={chat.lastMessage}
            unreadMessagesCount={chat.unreadMessagesCount}
            deliveryStatus={chat.deliveryStatus}
            read={chat.read}
            ownMessage={chat.ownMessage}
            profilePictureUrl={chat.profilePictureUrl}
          />
        ))}
      </div>
    </div>
  );
};

export default Chats;
