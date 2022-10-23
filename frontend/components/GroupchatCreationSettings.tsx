import { useMutation, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { formatError, formatPicURL } from '../helpers/stringFormatters';
import ISingleChat from '../interfaces/ISingleChat';
import styles from '../styles/GroupchatCreationSettings.module.css';
import { Avatar } from './atomic/Avatar';
import { BigButton, SmallButton } from './atomic/Button';
import { ErrorMessage } from './atomic/ErrorMessage';
import { FilePicker } from './atomic/FilePicker';
import { Input } from './atomic/Input';

interface GroupChatCreationSettingsProps {
  selectedContacts: string[];
  resetSelectedContacts: () => void;
  setSuccess: (success: boolean, chats: ISingleChat[]) => void;
  closeHandler: () => void;
}

export const GroupChatCreationSettings: React.FC<
  GroupChatCreationSettingsProps
> = ({ selectedContacts, resetSelectedContacts, setSuccess, closeHandler }) => {
  const [chatName, setChatName] = useState('');
  const [curPicture, setCurPicture] = useState('');
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

  const handleFileChange = (files: FileList) => {
    const firstFile = files[0];
    setCurPicture(URL.createObjectURL(firstFile));
  };

  return (
    <>
      <form className={styles.groupchatSettings} onSubmit={createGroupChat}>
        <h2 className={styles.groupchatSettingsHeading}>Groupchat settings</h2>
        <div className={styles.settings}>
          <div className={styles.picChanger}>
            <Avatar url={formatPicURL(curPicture)} size={'80px'} />
            <FilePicker
              handleFileChange={handleFileChange}
              buttonText="Select a picture"
            />
          </div>
          <Input
            placeholder="Chat name"
            value={chatName}
            onChange={(e) => setChatName(e.target.value)}
            autoFocus
          />
        </div>
        <BigButton type="submit" disabled={chatName.length <= 0}>
          Create Groupchat
        </BigButton>
        {sendRequest.isError && (
          <ErrorMessage errorMessage={formatError(sendRequest.error)} />
        )}
      </form>
      <SmallButton onClick={closeHandler}>Close</SmallButton>
    </>
  );
};
