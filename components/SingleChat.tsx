import Image from 'next/image';
import styles from '../styles/SingleChatComponent.module.css';
import fallbackProfilePicure from '../assets/images/fallback-pp.webp';

interface SingleChatProps {
  name: string;
  time: string;
  message: string;
  read: boolean;
  profilePictureUrl?: string;
}

const SingleChat: React.FC<SingleChatProps> = ({
  name,
  time,
  message,
  read,
  profilePictureUrl,
}) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.singleChatContainer}>
        <div className={styles.singleChat}>
          <div className={styles.profilePicture}>
            <Image
              className={styles.profilePicture}
              src={profilePictureUrl ?? fallbackProfilePicure}
              objectFit="cover"
              alt="pp"
              layout="fill"
            />
          </div>
          <div className={styles.chatContent}>
            <div className={styles.chatNameTime}>
              <h3 className={styles.name}>{name}</h3>
              <h3 className={styles.time} id={read ? styles.readTime : ''}>
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
