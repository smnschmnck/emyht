import styles from '../styles/ChatInfoHeaderComponent.module.css';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { formatPicURL as formatProfilePicURL } from '../helpers/stringFormatters';

interface ChatInfoHeaderProps {
  profilePictureUrl: string;
  chatID: string;
  chatName: string;
  closeChat: () => void;
}

export const ChatInfoHeader: React.FC<ChatInfoHeaderProps> = ({
  profilePictureUrl,
  chatID,
  chatName,
  closeChat,
}) => {
  const [lastOnline, setLastOnline] = useState('');

  const fetchChatInfo = async () => {
    //TODO: fetch with chatid
    //eg. fetch("/api/chatInfo/chatID")
    const json = {
      name: 'Shari Waelchi',
      lastOnline: '11:21',
    };
    setLastOnline(json.lastOnline);
  };

  useEffect(() => {
    fetchChatInfo();
  }, []);

  return (
    <div className={styles.chatHeader}>
      <div className={styles.innerChatHeader}>
        <button className={styles.closeButton} onClick={() => closeChat()} />
        <div className={styles.chatInfo}>
          <div className={styles.profilePicture}>
            <Image
              src={formatProfilePicURL(profilePictureUrl)}
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
        <button className={styles.moreButton} />
      </div>
    </div>
  );
};
