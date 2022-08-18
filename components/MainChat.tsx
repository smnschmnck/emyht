import { useEffect, useState } from 'react';
import styles from '../styles/MainChatComponent.module.css';
import { ChatInfoHeader } from './ChatInfoHeader';
import { ChatMessageContainer } from './ChatMessageContainer';
import { SendMessageForm } from './SendMessageForm';

interface MainChatProps {
  chatID: string;
  profilePictureUrl?: string;
  chatName: string;
  closeChat: () => void;
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
  closeChat,
}) => {
  const [messages, setMessages] = useState<ISingleMessage[]>([]);

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`/api/getChatMessages/${chatID}`);
      if (!res.ok) {
        alert(await res.text());
        return;
      }
      const json = (await res.json()) as ISingleMessage[];
      setMessages(json);
    };
    fetchMessages();
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
        <div className={styles.messageContainer}>
          <ChatMessageContainer messages={messages} />
        </div>
        <div className={styles.bottomControls}>
          <div className={styles.sendFormWrapper}>
            <SendMessageForm
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
