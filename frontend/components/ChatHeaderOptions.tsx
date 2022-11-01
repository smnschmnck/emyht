import { PopupButton } from './atomic/PopupButton';
import moreIcon from '../assets/images/more-grey.svg';
import { PopupOption, PopupOptions } from './atomic/PopupOptions';
import styles from '../styles/ChatInfoHeaderComponent.module.css';
import { useMutation } from '@tanstack/react-query';

interface ChatHeaderOptionsProps {
  chatType: 'group' | 'oneOnOne' | 'contactRequest' | 'other';
  chatID: string;
}

export const ChatHeaderOptions: React.FC<ChatHeaderOptionsProps> = ({
  chatType,
  chatID,
}) => {
  const leaveGroupChat = useMutation(['chats'], async () => {
    const body = {
      chatID: chatID,
    };
    const res = await fetch('/api/leaveGroupChat', {
      method: 'post',
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await res.json();
  });

  return (
    <PopupButton icon={moreIcon} buttonClassName={styles.moreButton} alignRight>
      {chatType === 'group' && (
        <PopupOptions>
          <PopupOption
            text="Leave Groupchat"
            clickHandler={leaveGroupChat.mutate}
            textColor="red"
          />
        </PopupOptions>
      )}
    </PopupButton>
  );
};
