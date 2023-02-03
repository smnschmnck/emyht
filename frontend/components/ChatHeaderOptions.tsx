import { PopupButton } from './atomic/PopupButton';
import moreIcon from '../assets/images/more-grey.svg';
import { PopupOption, PopupOptions } from './atomic/PopupOptions';
import styles from '../styles/ChatInfoHeaderComponent.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import router from 'next/router';

interface ChatHeaderOptionsProps {
  chatType: 'group' | 'one_on_one' | 'contactRequest' | 'other';
  chatID: string;
}

export const ChatHeaderOptions: React.FC<ChatHeaderOptionsProps> = ({
  chatType,
  chatID,
}) => {
  const queryClient = useQueryClient();

  const leaveGroupChat = useMutation(
    async () => {
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
    },
    {
      onSuccess: (data) => {
        router
          .push('/', undefined, {
            shallow: true,
          })
          .then(() => {
            queryClient.setQueriesData(['chats'], data);
          });
      },
    }
  );

  const addToGroupChat = useMutation(
    async () => {
      const body = {
        chatID: chatID,
      };

      const res = await fetch('/api/addToGroupChat', {
        method: 'post',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return await res.json();
    },
    {
      onSuccess: (data) => {
        queryClient.setQueriesData(['chats'], data);
      },
    }
  );

  return (
    <PopupButton icon={moreIcon} buttonClassName={styles.moreButton} alignRight>
      {chatType === 'group' && (
        <PopupOptions>
          <PopupOption text="Add user" clickHandler={() => alert('//TODO')} />
          <PopupOption
            text="Remove user"
            clickHandler={() => alert('//TODO')}
            textColor="red"
          />
          <PopupOption
            text="Leave Groupchat"
            clickHandler={leaveGroupChat.mutate}
            textColor="red"
          />
        </PopupOptions>
      )}
      {chatType === 'one_on_one' && (
        <PopupOptions>
          <PopupOption
            text="Add to chat"
            clickHandler={addToGroupChat.mutate}
          />
          <PopupOption
            text="Block user"
            clickHandler={() => alert('//TODO')}
            textColor="red"
          />
        </PopupOptions>
      )}
    </PopupButton>
  );
};
