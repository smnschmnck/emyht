import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { formatError } from '../helpers/stringFormatters';
import ISingleChat from '../interfaces/ISingleChat';
import styles from '../styles/GroupchatCreationSettings.module.css';
import { BigButton, BigButtonGreyHover } from './atomic/Button';
import { ErrorMessage } from './atomic/ErrorMessage';
import { Input } from './atomic/Input';

interface GroupChatCreationSettingsProps {
  selectedContacts: string[];
  resetSelectedContacts: () => void;
  setSuccess: (success: boolean, chats: ISingleChat[]) => void;
}

export const GroupChatCreationSettings: React.FC<
  GroupChatCreationSettingsProps
> = ({ selectedContacts, resetSelectedContacts, setSuccess }) => {
  const [chatName, setChatName] = useState('');
  const queryClient = useQueryClient();

  const sendRequest = useMutation(
    ['chats'],
    async () => {
      const body = {
        chatName: chatName,
        //TODO add functionality to add picture
        chatPicture: '',
        participantUUIDs: selectedContacts,
      };

      const res = await fetch('/api/startGroupChat', {
        method: 'post',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        resetSelectedContacts();
        throw new Error(await res.text());
      }

      const json: ISingleChat[] = await res.json();
      return json;
    },
    {
      onSuccess: (chats) => {
        setSuccess(true, chats);
        queryClient.invalidateQueries(['chats']);
      },
    }
  );

  const createGroupChat = async (e: FormEvent) => {
    e.preventDefault();
    sendRequest.mutate();
  };

  return (
    <>
      <form className={styles.groupchatSettings} onSubmit={createGroupChat}>
        <h2 className={styles.groupchatSettingsHeading}>Chat settings</h2>
        <Input
          placeholder="Chat name"
          value={chatName}
          onChange={(e) => setChatName(e.target.value)}
          autoFocus
        />
        <BigButtonGreyHover>Select a picture</BigButtonGreyHover>
        <BigButton type="submit" disabled={chatName.length <= 0}>
          Create Groupchat
        </BigButton>
        {sendRequest.isError && (
          <ErrorMessage errorMessage={formatError(sendRequest.error)} />
        )}
      </form>
    </>
  );
};
