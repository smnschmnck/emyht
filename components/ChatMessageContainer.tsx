import { useContext, useEffect, useRef, useState } from 'react';
import { UserCtx } from '../pages';
import styles from '../styles/ChatMessagesContainerComponent.module.css';
import { ISingleMessage } from './MainChat';
import { OwnMessage, ParticipantMessage } from './SingleChatMessage';

interface ChatMessageContainerProps {
  messages: ISingleMessage[];
}

export const ChatMessageContainer: React.FC<ChatMessageContainerProps> = ({
  messages,
}) => {
  const user = useContext(UserCtx);

  const messageBottom = useRef<HTMLDivElement>(null);
  const scrollMessagesToBottom = () => {
    messageBottom.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    scrollMessagesToBottom();
  }, [messages]);

  return (
    <div className={styles.messages}>
      {messages.map((message) => (
        <span key={message.messageID}>
          {message.senderID === user?.uuid && (
            <OwnMessage
              isPreview={message.messageID === 'preview'}
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
      <div ref={messageBottom} />
    </div>
  );
};
