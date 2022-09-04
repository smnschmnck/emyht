import { useState } from 'react';
import { BigButton, BigButtonGreyHover, SmallButton } from './atomic/Button';
import { ContactList } from './ContactList';
import styles from '../styles/GroupchatCreator.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { Contact } from './SingleContact';
import { GroupChatCreationSettings } from './GroupchatCreationSettings';

interface GroupChatCreaterProps {
  contacts: Contact[];
  closeHandler: () => void;
  setChats: (chats: ISingleChat[]) => void;
  setSuccess: (success: boolean) => void;
  isLoading: boolean;
}

export const GroupChatCreator: React.FC<GroupChatCreaterProps> = ({
  closeHandler,
  setChats,
  setSuccess,
  contacts,
  isLoading,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [showChatSettings, setShowChatSettings] = useState(false);

  const resetSelectedContacts = () => {
    setSelectedContacts([]);
  };

  const setSelectedContactsWrapper = (selectedContactsList: string[]) => {
    setSelectedContacts(selectedContactsList);
    setErrorMessage('');
  };

  return (
    <>
      {!showChatSettings && (
        <>
          <ContactList
            isLoading={isLoading}
            selectedContacts={selectedContacts}
            setSelectedContacts={setSelectedContactsWrapper}
            contacts={contacts}
            multiselect={true}
          />
          <div className={styles.buttons}>
            <BigButton
              onClick={() => setShowChatSettings(true)}
              disabled={selectedContacts.length <= 0}
            >
              Next Step
            </BigButton>
            <SmallButton onClick={closeHandler}>Cancel</SmallButton>
          </div>
        </>
      )}
      {showChatSettings && (
        <GroupChatCreationSettings
          errorMessage={errorMessage}
          setSuccess={setSuccess}
          selectedContacts={selectedContacts}
          setErrorMessage={setErrorMessage}
          setChats={setChats}
          resetSelectedContacts={resetSelectedContacts}
        />
      )}
    </>
  );
};
