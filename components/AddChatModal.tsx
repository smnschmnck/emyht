import styles from '../styles/AddChatModal.module.css';
import group from '../assets/images/group.svg';
import chat from '../assets/images/chat.svg';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { Tab, Tabs } from './atomic/Tabs';
import { useState } from 'react';
import { Contact } from './SingleContact';
import { ChatCreator } from './ChatCreator';
import { GroupChatCreator } from './GroupChatCreator';
import { useQuery } from '@tanstack/react-query';

interface AddChatModalProps {
  closeHandler: () => void;
  showContactReqModal: () => void;
}

export const AddChatModal: React.FC<AddChatModalProps> = ({
  closeHandler,
  showContactReqModal,
}) => {
  const [success, setSuccess] = useState(false);

  const fetchContacts = useQuery(['contacts'], async () => {
    const res = await fetch('/api/getContacts');
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return (await res.json()) as Contact[];
  });

  const contacts = fetchContacts.data ?? [];

  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
      {!success && (
        <div className={styles.main}>
          <div className={styles.header}>
            <h2 className={styles.heading}>New chat</h2>
          </div>
          {(contacts.length > 0 || fetchContacts.isLoading) && (
            <div className={styles.interface}>
              <Tabs>
                <Tab label="Chat" picture={chat}>
                  <ChatCreator
                    contacts={contacts}
                    closeHandler={closeHandler}
                    setSuccess={setSuccess}
                    isLoading={fetchContacts.isLoading}
                  />
                </Tab>
                <Tab label="Group" picture={group}>
                  <GroupChatCreator
                    contacts={contacts}
                    closeHandler={closeHandler}
                    setSuccess={setSuccess}
                    isLoading={fetchContacts.isLoading}
                  />
                </Tab>
              </Tabs>
            </div>
          )}
          {contacts.length <= 0 && !fetchContacts.isLoading && (
            <div className={styles.noContacts}>
              <h2>No contacts</h2>
              <BigButton onClick={showContactReqModal}>
                Send a contact request
              </BigButton>
              <SmallButton onClick={closeHandler}>Close</SmallButton>
            </div>
          )}
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
