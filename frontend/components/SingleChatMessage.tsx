import { formatTimestamp } from '../helpers/stringFormatters';
import styles from '../styles/SingleChatMessageComponent.module.css';

interface OwnMessageProps {
  timestamp: number;
  textContent: string;
  isPreview: boolean;
}

export const OwnMessage: React.FC<OwnMessageProps> = ({
  timestamp,
  textContent,
  isPreview,
}) => {
  return (
    <div className={styles.ownMessageWrapper}>
      <div className={styles.ownTextContentWrapper}>
        <p className={styles.textContent} id={isPreview ? styles.preview : ''}>
          {textContent}
        </p>
      </div>
      <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
    </div>
  );
};

interface ParticipantMessageProps {
  username: string;
  timestamp: number;
  textContent: string;
}

export const ParticipantMessage: React.FC<ParticipantMessageProps> = ({
  username,
  timestamp,
  textContent,
}) => {
  return (
    <div className={styles.participantMessageWrapper}>
      <div className={styles.participantMessageInfo}>
        <p className={styles.username}>{username}</p>
        <p className={styles.timestamp}>{formatTimestamp(timestamp)}</p>
      </div>
      <div className={styles.participantTextContentWrapper}>
        <p className={styles.textContent}>{textContent}</p>
      </div>
    </div>
  );
};
