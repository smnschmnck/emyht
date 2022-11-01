import { PopupButton } from './atomic/PopupButton';
import moreIcon from '../assets/images/more-grey.svg';
import { PopupOption, PopupOptions } from './atomic/PopupOptions';
import styles from '../styles/ChatInfoHeaderComponent.module.css';

interface ChatHeaderOptionsProps {
  chatType: 'group' | 'oneOnOne' | 'contactRequest' | 'other';
}

export const ChatHeaderOptions: React.FC<ChatHeaderOptionsProps> = ({
  chatType,
}) => {
  return (
    <PopupButton icon={moreIcon} buttonClassName={styles.moreButton} alignRight>
      {chatType === 'group' && (
        <PopupOptions>
          <PopupOption
            text="Leave Groupchat"
            clickHandler={() => alert('TODO')}
            textColor="red"
          />
        </PopupOptions>
      )}
    </PopupButton>
  );
};
