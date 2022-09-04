import { FormEvent, useState } from 'react';
import ISingleChat from '../interfaces/ISingleChat';
import styles from '../styles/GroupchatCreationSettings.module.css';
import { BigButton, BigButtonGreyHover } from './atomic/Button';
import { Input } from './atomic/Input';

interface GroupChatCreationSettingsProps {
  selectedContacts: string[];
  errorMessage: string;
  setErrorMessage: (errorMessage: string) => void;
  resetSelectedContacts: () => void;
  setChats: (chats: ISingleChat[]) => void;
  setSuccess: (success: boolean) => void;
}

export const GroupChatCreationSettings: React.FC<
  GroupChatCreationSettingsProps
> = ({
  errorMessage,
  setErrorMessage,
  selectedContacts,
  resetSelectedContacts,
  setChats,
  setSuccess,
}) => {
  const [chatName, setChatName] = useState('');

  const createGroupChat = async (e: FormEvent) => {
    e.preventDefault();
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
      setErrorMessage(await res.text());
      resetSelectedContacts();
      return;
    }

    const json: ISingleChat[] = await res.json();
    setChats(json);
    setSuccess(true);
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
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
      </form>
    </>
  );
};
