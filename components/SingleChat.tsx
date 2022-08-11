import Image from 'next/image';
import styles from '../styles/SingleChatComponent.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { formatPicURL } from '../helpers/picHelpers';

interface SingleChatProps extends ISingleChat {
  openChat: (chatID: string) => void;
}

const SingleChat: React.FC<SingleChatProps> = ({
  chatName: name,
  timestamp: time,
  textContent: message,
  unreadMessages: unreadMessagesCount,
  senderID: ownMessage,
  deliveryStatus,
  pictureUrl: profilePictureUrl,
  openChat,
  chatID,
}) => {
  return (
    <div className={styles.wrapper}>
      <button
        className={styles.singleChatContainer}
        onClick={() => openChat(chatID)}
      >
        <div className={styles.singleChat}>
          <div className={styles.profilePictureWrapper}>
            {!ownMessage && unreadMessagesCount > 0 && (
              <span className={styles.unreadMessagesNum}>
                {unreadMessagesCount < 9 ? unreadMessagesCount : '9+'}
              </span>
            )}
            <div className={styles.profilePicture}>
              <div className={styles.image}>
                <Image
                  src={formatPicURL(profilePictureUrl)}
                  objectFit="cover"
                  alt="pp"
                  layout="fill"
                />
              </div>
            </div>
          </div>
          <div className={styles.chatContent}>
            <div className={styles.chatNameTime}>
              <h3 className={styles.name}>{name}</h3>
              <h3
                className={styles.time}
                id={
                  unreadMessagesCount <= 0 || ownMessage ? styles.readTime : ''
                }
              >
                {time}
              </h3>
            </div>
            <p className={styles.chatText}>{message}</p>
          </div>
        </div>
      </button>
    </div>
  );
};

export default SingleChat;
