import styles from '../styles/AddChatModal.module.css';
import group from '../assets/images/group.svg';
import chat from '../assets/images/chat.svg';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { Tab, Tabs } from './atomic/Tabs';
import { useState } from 'react';
import { ContactOrChat } from './SingleContactOrChat';
import { ChatCreator } from './ChatCreator';
import { GroupChatCreator } from './GroupChatCreator';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ISingleChat from '../interfaces/ISingleChat';

interface AddChatModalProps {
  closeHandler: () => void;
  showContactReqModal: () => void;
  setCurChatID: (id: string) => void;
}

export const AddChatModal: React.FC<AddChatModalProps> = ({
  closeHandler,
  showContactReqModal,
  setCurChatID,
}) => {
  const [success, setSuccess] = useState(false);

  const fetchContacts = useQuery(['contacts'], async () => {
    const res = await fetch('/api/getContacts');
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return (await res.json()) as ContactOrChat[];
  });

  const contacts = fetchContacts.data ?? [];

  const successHandler = async (success: boolean, chats: ISingleChat[]) => {
    setSuccess(success);
    setCurChatID(chats[0].chatID);
  };

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
                    setSuccess={successHandler}
                    isLoading={fetchContacts.isLoading}
                  />
                </Tab>
                <Tab label="Group" picture={group}>
                  <GroupChatCreator
                    contacts={contacts}
                    closeHandler={closeHandler}
                    setSuccess={successHandler}
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
