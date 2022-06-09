import styles from '../styles/ChatInfoHeaderComponent.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface ChatInfoHeaderProps {
  profilePictureUrl: string;
  chatID: string;
}

export const ChatInfoHeader: React.FC<ChatInfoHeaderProps> = ({
  profilePictureUrl,
  chatID,
}) => {
  const [chatName, setChatName] = useState('');
  const [lastOnline, setLastOnline] = useState('');

  const fetchChatInfo = async () => {
    //TODO: fetch with chatid
    //eg. fetch("/api/chatInfo/chatID")
    const json = {
      name: 'Shari Waelchi',
      lastOnline: '11:21',
    };
    setChatName(json.name);
    setLastOnline(json.lastOnline);
  };

  useEffect(() => {
    fetchChatInfo();
  }, []);

  return (
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
  );
};
