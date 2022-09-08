import Image from 'next/image';
import styles from '../styles/SingleChatComponent.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { formatTimestamp, formatPicURL } from '../helpers/stringFormatters';
import { useContext } from 'react';
import { UserCtx } from '../pages';

interface SingleChatProps extends ISingleChat {
  openChat: (chatID: string) => void;
}

//TODO For groupchat show sender username of last message
const SingleChat: React.FC<SingleChatProps> = ({
  chatID,
  chatName,
  timestamp,
  textContent,
  unreadMessages,
  senderID,
  deliveryStatus,
  pictureUrl,
  openChat,
}) => {
  const user = useContext(UserCtx);
  const ownMessage = user?.uuid === senderID;
  return (
    <div className={styles.wrapper}>
      <button
        className={styles.singleChatContainer}
        onClick={() => openChat(chatID)}
      >
        <div className={styles.singleChat}>
          <div className={styles.profilePictureWrapper}>
            {!ownMessage && unreadMessages > 0 && (
              <span className={styles.unreadMessagesNum}>
                {unreadMessages < 9 ? unreadMessages : '9+'}
              </span>
            )}
            <div className={styles.profilePicture}>
              <div className={styles.image}>
                <Image
                  src={formatPicURL(pictureUrl)}
                  objectFit="cover"
                  alt="pp"
                  layout="fill"
                />
              </div>
            </div>
          </div>
          <div className={styles.chatContent}>
            <div className={styles.chatNameTime}>
              <h3 className={styles.name}>{chatName}</h3>
              <h3
                className={styles.time}
                id={unreadMessages <= 0 || ownMessage ? styles.readTime : ''}
              >
                {formatTimestamp(Number(timestamp))}
              </h3>
            </div>
            <p className={styles.chatText}>
              {/* TODO show message type */}
              {textContent ?? `Send a message to ${chatName}`}
            </p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default SingleChat;
