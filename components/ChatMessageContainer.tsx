import { useEffect, useState } from 'react';
import styles from '../styles/ChatMessagesContainer.module.css';

interface SingleMessageProps {
  messageID: string;
  timeStamp: string;
}

interface ChatMessageContainerProps {
  chatID: string;
}

export const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({
  chatID,
}) => {
  const [messages, setMessages] = useState<SingleMessageProps[]>([]);

  const fetchMessages = async () => {
    //TODO: fetch with chatid
    //eg. fetch("/api/chatMessages/chatID")
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className={styles.messages}>
      {messages.map((message) => (
        <p key={message.messageID}>{message.messageID}</p>
      ))}
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
      <h2>{chatID}</h2>
    </div>
  );
};
