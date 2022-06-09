import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import styles from '../styles/MainChatComponent.module.css';
import { InputWithButton } from './atomic/InputWithButton';

interface MainChatProps {
  chatID: string;
  profilePictureUrl: string;
}

interface SingleMessageProps {
  messageID: string;
  timeStamp: string;
}

const MainChat: React.FC<MainChatProps> = ({ chatID, profilePictureUrl }) => {
  const [chatName, setChatName] = useState('');
  const [lastOnline, setLastOnline] = useState('');
  const [messages, setMessages] = useState<SingleMessageProps[]>([]);
  const [messageInputValue, setMessageInputValue] = useState('');

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

  const fetchMessages = async () => {
    //TODO: fetch with chatid
    //eg. fetch("/api/chatMessages/chatID")
  };

  const sendMessage = (event: FormEvent) => {
    //TODO send message
    event.preventDefault();
    setMessageInputValue('');
    alert(`Sending Message with content: ${messageInputValue}\nTo: ${chatID}`);
  };

  useEffect(() => {
    fetchChatInfo();
  }, []);

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
        <h2>{chatID}</h2>
        <div className={styles.bottomControls}>
          <div className={styles.sendFormWrapper}>
            <InputWithButton
              buttonText={'Send'}
              inputPlaceHolder={'Type Message'}
              value={messageInputValue}
              setValue={setMessageInputValue}
              submitHandler={sendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainChat;
