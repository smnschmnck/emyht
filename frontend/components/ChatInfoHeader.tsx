import styles from '../styles/ChatInfoHeaderComponent.module.css';
import Image from 'next/image';
import { formatPicURL } from '../helpers/stringFormatters';
import { Avatar } from './atomic/Avatar';

interface ChatInfoHeaderProps {
  picUrl?: string;
  name: string;
  close: () => void;
  info?: string;
}

export const ChatInfoHeader: React.FC<ChatInfoHeaderProps> = ({
  picUrl,
  name,
  close,
  info,
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
        <button className={styles.moreButton} />
      </div>
    </div>
  );
};
