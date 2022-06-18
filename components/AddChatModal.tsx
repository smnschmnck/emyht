import styles from '../styles/AddChatModal.module.css';
import group from '../assets/images/group.svg';
import chat from '../assets/images/chat.svg';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { ContactList } from './ContactList';
import { Contact } from './SingleContact';
import { Tab, Tabs } from './atomic/Tabs';
import { useEffect, useState } from 'react';

interface AddChatModalProps {
  closeHandler: () => void;
}

const fakeContacts: Contact[] = [
  {
    id: '44b566-b465f4-b4564564',
    name: 'Maximilian Berger',
    profilePictureUrl:
      'https://loremflickr.com/cache/resized/65535_52016243732_73712e2714_b_640_480_nofilter.jpg',
  },
  {
    id: '3345-34g43gn3-3545',
    name: 'John Doe',
    profilePictureUrl:
      'https://loremflickr.com/cache/resized/65535_51950170317_e4c7332e32_c_640_480_nofilter.jpg',
  },
];

export const AddChatModal: React.FC<AddChatModalProps> = ({ closeHandler }) => {
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const resetSelectedContacts = () => {
    setSelectedContacts([]);
  };

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
                selectedContacts={selectedContacts}
                setSelectedContacts={setSelectedContacts}
                contacts={fakeContacts}
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
                selectedContacts={selectedContacts}
                setSelectedContacts={setSelectedContacts}
                contacts={fakeContacts}
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
