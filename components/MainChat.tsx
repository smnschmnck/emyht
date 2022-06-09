import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/MainChatComponent.module.css';
import { ChatMessageContainer } from './ChatMessageContainer';
import { SendMessageForm } from './SendMessageForm';

interface MainChatProps {
  chatID: string;
  profilePictureUrl: string;
}

const MainChat: React.FC<MainChatProps> = ({ chatID, profilePictureUrl }) => {
  const [chatName, setChatName] = useState('');
  const [lastOnline, setLastOnline] = useState('');
  const messageContainer = useRef<HTMLDivElement>(null);

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
    if (messageContainer?.current) {
      messageContainer.current.scrollTop =
        messageContainer?.current?.scrollHeight;
    }
    fetchChatInfo();
  }, [chatID]);

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
      <div className={styles.chatContainer}>
        <div className={styles.messageContainer} ref={messageContainer}>
          <ChatMessageContainer chatID={chatID} />
        </div>
        <div className={styles.bottomControls}>
          <div className={styles.sendFormWrapper}>
            <SendMessageForm chatID={chatID} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainChat;
