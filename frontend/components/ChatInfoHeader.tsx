import styles from '../styles/ChatInfoHeaderComponent.module.css';
import { formatPicURL } from '../helpers/stringFormatters';
import { Avatar } from './atomic/Avatar';
import { ChatHeaderOptions } from './ChatHeaderOptions';

interface ChatInfoHeaderProps {
  picUrl?: string;
  name: string;
  close: () => void;
  info?: string;
  chatType: 'group' | 'oneOnOne' | 'contactRequest' | 'other';
  chatID: string;
}

export const ChatInfoHeader: React.FC<ChatInfoHeaderProps> = ({
  picUrl,
  name,
  close,
  info,
  chatType,
  chatID,
}) => {
  return (
    <div className={styles.chatHeader}>
      <div className={styles.innerChatHeader}>
        <button className={styles.closeButton} onClick={() => close()} />
        <div className={styles.chatInfo}>
          <Avatar url={formatPicURL(picUrl)} size={'40px'} />
          <div className={styles.nameAndLastOnline}>
            <h3 className={styles.chatName}>{name}</h3>
            <p className={styles.lastOnline}>{info}</p>
          </div>
        </div>
        <ChatHeaderOptions chatType={chatType} chatID={chatID} />
      </div>
    </div>
  );
};
