import { useEffect, useRef, useState } from 'react';
import styles from '../styles/MainChatComponent.module.css';
import { ChatInfoHeader } from './ChatInfoHeader';
import { ChatMessageContainer } from './ChatMessageContainer';
import { SendMessageForm } from './SendMessageForm';

interface MainChatProps {
  chatID: string;
  profilePictureUrl: string;
  chatName: string;
  closeChat: () => void;
}

const MainChat: React.FC<MainChatProps> = ({
  chatID,
  profilePictureUrl,
  chatName,
  closeChat,
}) => {
  const messageContainer = useRef<HTMLDivElement>(null);

  const scrollMessagesToTop = () => {
    if (messageContainer?.current) {
      messageContainer.current.scrollTop =
        messageContainer?.current?.scrollHeight;
    }
  };

  useEffect(() => {
    scrollMessagesToTop();
  }, [chatID]);

  return (
    <div className={styles.mainChat}>
      <ChatInfoHeader
        profilePictureUrl={profilePictureUrl}
        chatID={chatID}
        chatName={chatName}
        closeChat={closeChat}
      />
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
