import { useState } from 'react';
import { BigButton, SmallButton } from './atomic/Button';
import { ContactList } from './ContactList';
import styles from '../styles/GroupchatCreator.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { Contact } from './SingleContact';
import { GroupChatCreationSettings } from './GroupchatCreationSettings';

interface GroupChatCreaterProps {
  contacts: Contact[];
  closeHandler: () => void;
  setSuccess: (success: boolean, chats: ISingleChat[]) => void;
  isLoading: boolean;
}

export const GroupChatCreator: React.FC<GroupChatCreaterProps> = ({
  closeHandler,
  setSuccess,
  contacts,
  isLoading,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showChatSettings, setShowChatSettings] = useState(false);

  const resetSelectedContacts = () => {
    setSelectedContacts([]);
  };

  const setSelectedContactsWrapper = (selectedContactsList: string[]) => {
    setSelectedContacts(selectedContactsList);
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
          setSuccess={setSuccess}
          selectedContacts={selectedContacts}
          resetSelectedContacts={resetSelectedContacts}
        />
      )}
    </>
  );
};
