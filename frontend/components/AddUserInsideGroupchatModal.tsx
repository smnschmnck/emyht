import styles from '../styles/AddToGroupchatModal.module.css';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ContactList } from './ContactList';
import { ContactOrChat } from './SingleContactOrChat';

interface AddUserInsideGroupchatModalProps {
  chatID: string;
  chatName: string;
  closeHandler: () => void;
}

export const AddUserInsideGroupchatModal: React.FC<
  AddUserInsideGroupchatModalProps
> = ({ chatID, chatName, closeHandler }) => {
  const [success, setSuccess] = useState(false);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  const {
    data: contactsNotInChat,
    isLoading: isLoadingContacts,
    error,
  } = useQuery([`contactsNotInChat/${chatID}`], async () => {
    const res = await fetch(`/api/getContactsNotInChat/${chatID}`);
    if (!res.ok) throw new Error(await res.text());
    return (await res.json()) as ContactOrChat[];
  });

  const addUsersMutation = useMutation(
    async () => {
      const body = {
        participantUUIDs: selectedContacts,
        chatID: chatID,
      };

      const res = await fetch('/api/addUsersToGroupchat', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }
    },
    {
      onSuccess: () => {
        setSuccess(true);
      },
    }
  );

  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
      {!success && (
        <div className={styles.main}>
          <div className={styles.header}>
            <h2 className={styles.heading}>Add to Groupchats</h2>
          </div>
          <div className={styles.interface}>
            <ContactList
              selectedContacts={selectedContacts}
              setSelectedContacts={setSelectedContacts}
              contacts={contactsNotInChat ?? []}
              multiselect
              isLoading={isLoadingContacts}
            />
            <div className={styles.buttons}>
              <BigButton onClick={addUsersMutation.mutate}>
                Add to chat
              </BigButton>
              <SmallButton onClick={closeHandler}>Close</SmallButton>
            </div>
          </div>
        </div>
      )}
      {success && (
        <div className={styles.successContainer}>
          <div className={styles.innerSuccessContainer}>
            <h2>Users added to {chatName} successfully 🥳</h2>
            <SmallButton onClick={closeHandler}>Continue</SmallButton>
          </div>
        </div>
      )}
    </Modal>
  );
};
