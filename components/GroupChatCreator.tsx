import { FormEvent, useState } from 'react';
import { BigButton, BigButtonGreyHover, SmallButton } from './atomic/Button';
import { ContactList } from './ContactList';
//TODO use seperate css file
import styles from '../styles/AddChatModal.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { Contact } from './SingleContact';
import { Input } from './atomic/Input';

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
  const [chatName, setChatName] = useState('');

  const createGroupChat = async (e: FormEvent) => {
    e.preventDefault();
    const body = {
      chatName: chatName,
      //TODO add functionality to add picture
      chatPicture: '',
      participantUUIDs: selectedContacts,
    };

    const res = await fetch('/api/startGroupChat', {
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
            {errorMessage && (
              <p className={styles.errorMessage}>{errorMessage}</p>
            )}
            <SmallButton onClick={closeHandler}>Cancel</SmallButton>
          </div>
        </>
      )}
      {showChatSettings && (
        <>
          <form className={styles.groupchatSettings} onSubmit={createGroupChat}>
            <h2 className={styles.groupchatSettingsHeading}>Chat settings</h2>
            <Input
              placeholder="Chat name"
              value={chatName}
              onChange={(e) => setChatName(e.target.value)}
              autoFocus
            />
            <BigButtonGreyHover>Select a picture</BigButtonGreyHover>
            <BigButton type="submit" disabled={chatName.length <= 0}>
              Create Groupchat
            </BigButton>
          </form>
        </>
      )}
    </>
  );
};
