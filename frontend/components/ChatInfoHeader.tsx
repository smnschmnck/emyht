import styles from '../styles/ChatInfoHeaderComponent.module.css';
import { formatPicURL } from '../helpers/stringFormatters';
import { Avatar } from './atomic/Avatar';
import { PopupButton } from './atomic/PopupButton';
import moreIcon from '../assets/images/more-grey.svg';
import { PopupOption, PopupOptions } from './atomic/PopupOptions';

interface ChatInfoHeaderProps {
  picUrl?: string;
  name: string;
  close: () => void;
  info?: string;
  chatType: string;
}

export const ChatInfoHeader: React.FC<ChatInfoHeaderProps> = ({
  picUrl,
  name,
  close,
  info,
  chatType,
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
        <PopupButton
          icon={moreIcon}
          buttonClassName={styles.moreButton}
          alignRight
        >
          {chatType === 'group' && (
            <PopupOptions>
              <PopupOption
                text="Leave Groupchat"
                clickHandler={() => alert('TODO')}
              />
            </PopupOptions>
          )}
        </PopupButton>
      </div>
    </div>
  );
};
