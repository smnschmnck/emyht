import { useContext, useEffect, useRef, useState } from 'react';
import { UserCtx } from '../pages';
import styles from '../styles/ChatMessagesContainerComponent.module.css';
import { OwnMessage, ParticipantMessage } from './SingleChatMessage';

interface ISingleMessage {
  messageID: string;
  senderID: string;
  senderUsername: string;
  textContent: string;
  messageType: string;
  medieUrl: string;
  timestamp: number;
  deliveryStatus: string;
}

interface ChatMessageContainerProps {
  chatID: string;
}

export const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({
  chatID,
}) => {
  const [messages, setMessages] = useState<ISingleMessage[]>([]);
  const user = useContext(UserCtx);

  const messageBottom = useRef<HTMLSpanElement>(null);

  const scrollMessagesToBottom = () => {
    messageBottom.current?.scrollIntoView({ behavior: 'auto' });
  };

  const fetchMessages = async () => {
    const res = await fetch(`/api/getChatMessages/${chatID}`);
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    const json = (await res.json()) as ISingleMessage[];
    setMessages(json);
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  useEffect(() => {
    scrollMessagesToBottom();
  }, [messages]);

  return (
    <div className={styles.messages}>
      {messages.map((message) => (
        <span key={message.messageID}>
          {message.senderID === user?.uuid && (
            <OwnMessage
              timestamp={message.timestamp}
              textContent={message.textContent}
            />
          )}
          {message.senderID !== user?.uuid && (
            <ParticipantMessage
              username={message.senderUsername}
              timestamp={message.timestamp}
              textContent={message.textContent}
            />
          )}
        </span>
      ))}
      <span ref={messageBottom} />
    </div>
  );
};
