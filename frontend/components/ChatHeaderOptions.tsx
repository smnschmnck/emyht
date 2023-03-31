import { PopupButton } from './atomic/PopupButton';
import moreIcon from '../assets/images/more-grey.svg';
import { PopupOption, PopupOptions } from './atomic/PopupOptions';
import styles from '../styles/ChatInfoHeaderComponent.module.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import router from 'next/router';
import ISingleChat from '../interfaces/ISingleChat';
import { Modal } from './atomic/Modal';
import { useState } from 'react';
import { AddChatModal } from './AddChatModal';
import { AddToGroupchatsModal } from './AddUserToGroupchatModal';
import { AddUserInsideGroupchatModal } from './AddUserInsideGroupchatModal';

const OneOnOneChatHeaderOptions: React.FC<{
  chatID: string;
  name: string;
}> = ({ name, chatID }) => {
  const [showGroupChatsModal, setShowGroupChatsModal] = useState(false);

  return (
    <>
      {showGroupChatsModal && (
        <AddToGroupchatsModal
          chatID={chatID}
          username={name}
          closeHandler={() => setShowGroupChatsModal(false)}
        />
      )}
      <PopupButton
        icon={moreIcon}
        buttonClassName={styles.moreButton}
        alignRight
      >
        <PopupOptions>
          <PopupOption
            text="Add to chat"
            clickHandler={() => setShowGroupChatsModal(true)}
          />
          <PopupOption
            text="Block user"
            clickHandler={() => alert('//TODO')}
            textColor="red"
          />
        </PopupOptions>
      </PopupButton>
    </>
  );
};

const GroupchatHeaderOptions: React.FC<{
  chatID: string;
  chatName: string;
}> = ({ chatID, chatName }) => {
  const queryClient = useQueryClient();
  const [showUserModal, setShowUserModal] = useState(false);

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

  return (
    <>
      {showUserModal && (
        <AddUserInsideGroupchatModal
          chatID={chatID}
          chatName={chatName}
          closeHandler={() => setShowUserModal(false)}
        />
      )}
      <PopupButton
        icon={moreIcon}
        buttonClassName={styles.moreButton}
        alignRight
      >
        <PopupOptions>
          <PopupOption
            text="Add user"
            clickHandler={() => setShowUserModal(true)}
          />
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
      </PopupButton>
    </>
  );
};

interface ChatHeaderOptionsProps {
  chatType: 'group' | 'one_on_one' | 'contactRequest' | 'other';
  name: string;
  chatID: string;
}

export const ChatHeaderOptions: React.FC<ChatHeaderOptionsProps> = ({
  chatType,
  chatID,
  name,
}) => {
  return (
    <>
      {chatType === 'group' && (
        <GroupchatHeaderOptions chatID={chatID} chatName={name} />
      )}
      {chatType === 'one_on_one' && (
        <OneOnOneChatHeaderOptions chatID={chatID} name={name} />
      )}
    </>
  );
};
