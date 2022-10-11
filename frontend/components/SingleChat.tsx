import Image from 'next/image';
import styles from '../styles/SingleChatComponent.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { formatTimestamp, formatPicURL } from '../helpers/stringFormatters';
import IUser from '../interfaces/IUser';
import { useQuery } from '@tanstack/react-query';
import { MessageTypeIcon } from './MessageTypeIcon';

interface SingleChatProps extends ISingleChat {
  openChat: (chatID: string) => void;
}

const SingleChat: React.FC<SingleChatProps> = ({
  chatID,
  chatName,
  chatType,
  timestamp,
  textContent,
  unreadMessages,
  senderID,
  pictureUrl,
  openChat,
  messageType,
  senderUsername,
}) => {
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;
  const ownMessage = user?.uuid === senderID;

  const formatTextContent = (messageType?: string, textContent?: string) => {
    if (!textContent) {
      if (messageType && messageType !== 'plaintext') {
        const firstCharUpperCase = messageType.charAt(0).toUpperCase();
        const stringAfterFirstChar = messageType.slice(1);
        return firstCharUpperCase + stringAfterFirstChar;
      }
      return `Send a message to ${chatName}`;
    }
    if (chatType === 'group') {
      if (senderID !== user?.uuid) {
        return `${senderUsername}: ${textContent}`;
      }
    }
    return textContent;
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.singleChatContainer}
        onClick={() => openChat(chatID)}
      >
        <div className={styles.singleChat}>
          <div className={styles.profilePictureWrapper}>
            {!ownMessage && unreadMessages > 0 && (
              <span className={styles.unreadMessagesNum}>
                {unreadMessages < 9 ? unreadMessages : '9+'}
              </span>
            )}
            <div className={styles.profilePicture}>
              <div className={styles.image}>
                <Image
                  src={formatPicURL(pictureUrl)}
                  objectFit="cover"
                  alt="pp"
                  layout="fill"
                />
              </div>
            </div>
          </div>
          <div className={styles.chatContent}>
            <div className={styles.chatNameTime}>
              <h3 className={styles.name}>{chatName}</h3>
              <h3
                className={styles.time}
                id={unreadMessages <= 0 || ownMessage ? styles.readTime : ''}
              >
                {formatTimestamp(Number(timestamp))}
              </h3>
            </div>
            <span className={styles.chatPreview}>
              {messageType && messageType !== 'plaintext' && (
                <MessageTypeIcon messageType={messageType ?? ''} />
              )}
              <p className={styles.chatText}>
                {formatTextContent(messageType, textContent)}
              </p>
            </span>
          </div>
        </div>
      </button>
    </div>
  );
};

export default SingleChat;
