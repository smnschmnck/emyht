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
}

export const AddChatModal: React.FC<AddChatModalProps> = ({ closeHandler }) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  useEffect(() => {
    fetchContacts();
  }, []);

  const createGroupChat = () => {
    //TODO: send to backend
    alert('Creating groupchat with: ' + JSON.stringify(selectedContacts));
  };

  const createChat = () => {
    //TODO: send to backend
    alert('Creating chat with: ' + selectedContacts[0]);
  };

  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
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
                setSelectedContacts={setSelectedContacts}
                contacts={contacts}
              />
              <div className={styles.buttons}>
                <BigButton
                  onClick={() => createChat()}
                  disabled={selectedContacts.length <= 0}
                >
                  Start chat
                </BigButton>
                <SmallButton onClick={closeHandler}>Cancel</SmallButton>
              </div>
            </Tab>
            <Tab label="Group" picture={group}>
              <ContactList
                isLoading={isLoading}
                selectedContacts={selectedContacts}
                setSelectedContacts={setSelectedContacts}
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
                <SmallButton onClick={closeHandler}>Cancel</SmallButton>
              </div>
            </Tab>
          </Tabs>
        </div>
      </div>
    </Modal>
  );
};
