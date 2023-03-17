import { useState } from 'react';
import { BigButton, SmallButton } from './atomic/Button';
import { ContactList } from './ContactList';
import styles from '../styles/ChatCreator.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { ContactOrChat } from './SingleContactOrChat';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatError } from '../helpers/stringFormatters';
import { ErrorMessage } from './atomic/ErrorMessage';

interface ChatCreaterProps {
  contacts: ContactOrChat[];
  closeHandler: () => void;
  setSuccess: (success: boolean, chats: ISingleChat[]) => void;
  isLoading: boolean;
}

export const ChatCreator: React.FC<ChatCreaterProps> = ({
  closeHandler,
  setSuccess,
  contacts,
  isLoading,
}) => {
  const [selectedContact, setSelectedContact] = useState('');
  const queryClient = useQueryClient();

  const sendRequest = useMutation(
    ['chats'],
    async () => {
      const body = {
        participantUUID: selectedContact,
      };
      const res = await fetch('/api/startOneOnOneChat', {
        method: 'post',
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const json: ISingleChat[] = await res.json();
      return json;
    },
    {
      onSuccess: (chats) => {
        setSuccess(true, chats);
        setSelectedContact('');
        queryClient.invalidateQueries<ISingleChat[]>(['chats']);
      },
    }
  );

  const setSelectedContactsWrapper = (selectedContactsList: string[]) => {
    setSelectedContact(selectedContactsList[0]);
  };

  return (
    <>
      <ContactList
        isLoading={isLoading}
        selectedContacts={[selectedContact]}
        setSelectedContacts={setSelectedContactsWrapper}
        contacts={contacts}
      />
      <div className={styles.buttons}>
        <BigButton
          onClick={() => sendRequest.mutate()}
          disabled={!selectedContact}
        >
          Start chat
        </BigButton>
        {sendRequest.isError && (
          <ErrorMessage errorMessage={formatError(sendRequest.error)} />
        )}
        <SmallButton onClick={closeHandler}>Cancel</SmallButton>
      </div>
    </>
  );
};
