import styles from '../styles/AddChatModal.module.css';
import group from '../assets/images/group.svg';
import chat from '../assets/images/chat.svg';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { ContactList } from './ContactList';
import { Tab, Tabs } from './atomic/Tabs';
import { useEffect, useState } from 'react';
import { Contact } from './SingleContact';

interface AddChatModalProps {
  closeHandler: () => void;
  refreshChats: () => void;
}

export const AddChatModal: React.FC<AddChatModalProps> = ({
  closeHandler,
  refreshChats,
}) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const resetSelectedContacts = () => {
    setSelectedContacts([]);
  };

  const fetchContacts = async () => {
    const res = await fetch('/api/getContacts');
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    const json = await res.json();
    setContacts(json);
    setIsLoading(false);
  };

  const setSelectedContactsWrapper = (selectedContactsList: string[]) => {
    setSelectedContacts(selectedContactsList);
    setErrorMessage('');
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const createGroupChat = () => {
    //TODO: send to backend
    alert('Creating groupchat with: ' + JSON.stringify(selectedContacts));
  };

  const createChat = async () => {
    //TODO: send to backend
    const participantUUID = selectedContacts[0];
    const body = {
      participantUUID: participantUUID,
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
    refreshChats();
    setSuccess(true);
  };

  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
      {!success && (
        <div className={styles.main}>
          <div className={styles.header}>
            <h2 className={styles.heading}>New chat</h2>
          </div>
          <div className={styles.interface}>
            <Tabs onTabChange={resetSelectedContacts}>
              <Tab label="Chat" picture={chat}>
                <ContactList
                  isLoading={isLoading}
                  selectedContacts={selectedContacts}
                  setSelectedContacts={setSelectedContactsWrapper}
                  contacts={contacts}
                />
                <div className={styles.buttons}>
                  <BigButton
                    onClick={() => createChat()}
                    disabled={selectedContacts.length <= 0}
                  >
                    Start chat
                  </BigButton>
                  {errorMessage && (
                    <p className={styles.errorMessage}>{errorMessage}</p>
                  )}
                  <SmallButton onClick={closeHandler}>Cancel</SmallButton>
                </div>
              </Tab>
              <Tab label="Group" picture={group}>
                <ContactList
                  isLoading={isLoading}
                  selectedContacts={selectedContacts}
                  setSelectedContacts={setSelectedContactsWrapper}
                  contacts={contacts}
                  multiselect={true}
                />
                <div className={styles.buttons}>
                  <BigButton
                    onClick={() => createGroupChat()}
                    disabled={selectedContacts.length <= 0}
                  >
                    Create groupchat
                  </BigButton>
                  {errorMessage && (
                    <p className={styles.errorMessage}>{errorMessage}</p>
                  )}
                  <SmallButton onClick={closeHandler}>Cancel</SmallButton>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      )}
      {success && (
        <div className={styles.successContainer}>
          <div className={styles.innerSuccessContainer}>
            <h2>Chat created Succesfully 🥳</h2>
            <SmallButton onClick={closeHandler}>Continue</SmallButton>
          </div>
        </div>
      )}
    </Modal>
  );
};
