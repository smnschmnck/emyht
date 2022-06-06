import Image from 'next/image';
import styles from '../styles/MainChatComponent.module.css';

interface MainChatProps {
  chatName: string;
  lastOnline: string;
  profilePictureUrl: string;
}

const MainChat: React.FC<MainChatProps> = ({
  chatName,
  lastOnline,
  profilePictureUrl,
}) => {
  return (
    <div className={styles.mainChat}>
      <div className={styles.chatHeader}>
        <div className={styles.innerChatHeader}>
          <div className={styles.chatInfo}>
            <div className={styles.profilePicture}>
              <Image
                src={profilePictureUrl}
                alt="profile-picture"
                layout="fill"
                objectFit="cover"
              />
            </div>
            <div className={styles.nameAndLastOnline}>
              <h3 className={styles.chatName}>{chatName}</h3>
              <p className={styles.lastOnline}>{lastOnline}</p>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.messageContainer}></div>
    </div>
  );
};

export default MainChat;
