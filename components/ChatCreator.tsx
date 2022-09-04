import { useState } from 'react';
import { BigButton, SmallButton } from './atomic/Button';
import { ContactList } from './ContactList';
import styles from '../styles/ChatCreator.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { Contact } from './SingleContact';

interface ChatCreaterProps {
  contacts: Contact[];
  closeHandler: () => void;
  setChats: (chats: ISingleChat[]) => void;
  setSuccess: (success: boolean) => void;
  isLoading: boolean;
}

export const ChatCreator: React.FC<ChatCreaterProps> = ({
  closeHandler,
  setChats,
  setSuccess,
  contacts,
  isLoading,
}) => {
  const [selectedContact, setSelectedContact] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const createChat = async () => {
    const body = {
      participantUUID: selectedContact,
    };
    const res = await fetch('/api/startOneOnOneChat', {
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

  const resetSelectedContacts = () => {
    setSelectedContact('');
  };

  const setSelectedContactsWrapper = (selectedContactsList: string[]) => {
    setSelectedContact(selectedContactsList[0]);
    setErrorMessage('');
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
        <BigButton onClick={() => createChat()} disabled={!selectedContact}>
          Start chat
        </BigButton>
        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        <SmallButton onClick={closeHandler}>Cancel</SmallButton>
      </div>
    </>
  );
};
