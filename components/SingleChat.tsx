import Image from 'next/image';
import styles from '../styles/SingleChatComponent.module.css';
import fallbackProfilePicure from '../assets/images/fallback-pp.webp';
import ISingleChat from '../interfaces/ISingleChat';

interface SingleChatProps extends ISingleChat {
  openChat: (
    curChatID: string,
    profilePictureUrl: string,
    chatName: string
  ) => void;
}

const SingleChat: React.FC<SingleChatProps> = ({
  name,
  time,
  lastMessage: message,
  read,
  unreadMessagesCount,
  ownMessage,
  deliveryStatus,
  profilePictureUrl,
  openChat,
  chatID,
}) => {
  return (
    <div className={styles.wrapper}>
      <button
        className={styles.singleChatContainer}
        onClick={() => openChat(chatID, profilePictureUrl, name)}
      >
        <div className={styles.singleChat}>
          <div className={styles.profilePictureWrapper}>
            {!ownMessage && !read && unreadMessagesCount && (
              <span className={styles.unreadMessagesNum}>
                {unreadMessagesCount < 9 ? unreadMessagesCount : '9+'}
              </span>
            )}
            <div className={styles.profilePicture}>
              <div className={styles.image}>
                <Image
                  src={profilePictureUrl ?? fallbackProfilePicure}
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
                id={read || ownMessage ? styles.readTime : ''}
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
