import { useEffect, useState } from 'react';
import styles from '../styles/MainChatComponent.module.css';
import { ChatInfoHeader } from './ChatInfoHeader';
import { ChatMessageContainer } from './ChatMessageContainer';
import { SendMessageForm } from './SendMessageForm';

interface MainChatProps {
  chatID: string;
  profilePictureUrl?: string;
  chatName: string;
  messages: ISingleMessage[];
  setMessages: (messages: ISingleMessage[]) => void;
  closeChat: () => void;
  fetchMessages: (chatID: string) => void;
}

export interface ISingleMessage {
  messageID: string;
  senderID: string;
  senderUsername: string;
  textContent: string;
  messageType: string;
  medieUrl: string;
  timestamp: number;
  deliveryStatus: string;
}

const MainChat: React.FC<MainChatProps> = ({
  chatID,
  profilePictureUrl,
  chatName,
  messages,
  setMessages,
  closeChat,
  fetchMessages,
}) => {
  return (
    <div className={styles.mainChat}>
      <ChatInfoHeader
        profilePictureUrl={profilePictureUrl}
        chatID={chatID}
        chatName={chatName}
        closeChat={closeChat}
      />
      <div className={styles.chatContainer}>
        <div className={styles.messageContainer}>
          <ChatMessageContainer messages={messages} />
        </div>
        <div className={styles.bottomControls}>
          <div className={styles.wrapper}>
            <SendMessageForm
              fetchMessages={fetchMessages}
              chatID={chatID}
              messages={messages}
              setMessages={setMessages}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainChat;
