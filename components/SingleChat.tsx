import Image from 'next/image';
import styles from '../styles/SingleChatComponent.module.css';
import fallbackProfilePicure from '../assets/images/fallback-pp.webp';
import ISingleChat from '../interfaces/ISingleChat';

const SingleChat: React.FC<ISingleChat> = ({
  name,
  time,
  lastMessage: message,
  read,
  unreadMessagesCount,
  ownMessage,
  deliveryStatus,
  profilePictureUrl,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.singleChatContainer}>
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
      </div>
    </div>
  );
};

export default SingleChat;
