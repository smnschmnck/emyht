import styles from '../styles/ChatsComponent.module.css';
import plus from '../assets/images/plus.svg';
import { Input } from './atomic/Input';
import Image from 'next/image';
import SingleChat from './SingleChat';
import ISingleChat from '../interfaces/ISingleChat';

interface ISingleChatWithMessageID extends ISingleChat {
  messageID: string;
}

interface ChatsProps {
  chats: ISingleChatWithMessageID[];
}

const Chats: React.FC<ChatsProps> = ({ chats }) => {
  return (
    <div className={styles.chatWrapper}>
      <div className={styles.controls}>
        <div className={styles.chatContainer}>
          <div className={styles.chatsHeader}>
            <h2 className={styles.chatsHeading}>Chats</h2>
            <button className={styles.addChatButton}>
              <Image src={plus} alt="Add Chat" />
            </button>
          </div>
          <Input placeholder="Search Chats"></Input>
        </div>
      </div>
      <div className={styles.chats}>
        {chats.map((chat) => (
          <SingleChat
            key={chat.messageID}
            name={chat.name}
            time={chat.time}
            message={chat.message}
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
