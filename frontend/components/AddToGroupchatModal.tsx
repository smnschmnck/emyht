import styles from '../styles/AddToGroupchatModal.module.css';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ISingleChat from '../interfaces/ISingleChat';
import { Loader } from './atomic/Loader';
import { SingleContactOrChat } from './SingleContactOrChat';
import { Input } from './atomic/Input';

interface AddToGroupchatModalProps {
  username: string;
  closeHandler: () => void;
}

export const AddToGroupChatModal: React.FC<AddToGroupchatModalProps> = ({
  username,
  closeHandler,
}) => {
  const [success, setSuccess] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery<ISingleChat[]>(['chats'], async () => {
    const res = await fetch('/api/getChats');
    return (await res.json()) as ISingleChat[];
  });
  const chats = data ?? [];

  const selectChat = (id: string) => {
    if (selectedChats.includes(id)) {
      setSelectedChats(selectedChats.filter((chatID) => chatID !== id));
      return;
    }

    setSelectedChats([...selectedChats, id]);
  };

  const getFilteredChats = () => {
    return chats
      .filter((chat) => chat.chatType === 'group')
      .filter(
        (chat) =>
          chat.chatName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          selectedChats.includes(chat.chatID)
      );
  };

  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
      {!success && (
        <div className={styles.main}>
          <div className={styles.header}>
            <h2 className={styles.heading}>Add to Groupchat</h2>
          </div>
          {isLoading && <Loader />}
          {chats.length > 0 && (
            <div className={styles.interface}>
              <Input
                placeholder="Search chats"
                onChange={(t) => setSearchQuery(t.target.value)}
                value={searchQuery}
              />
              <div className={styles.chatList}>
                {getFilteredChats().map((chat) => (
                  <div key={chat.chatID}>
                    <SingleContactOrChat
                      profilePictureUrl={chat.pictureUrl}
                      select={selectChat}
                      selected={selectedChats.includes(chat.chatID)}
                      id={chat.chatID}
                      name={chat.chatName}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.buttons}>
                <BigButton>Add to chat</BigButton>
                <SmallButton onClick={closeHandler}>Cancel</SmallButton>
              </div>
            </div>
          )}
        </div>
      )}
      {success && (
        <div className={styles.successContainer}>
          <div className={styles.innerSuccessContainer}>
            <h2>{username} added successfully 🥳</h2>
            <SmallButton onClick={closeHandler}>Continue</SmallButton>
          </div>
        </div>
      )}
    </Modal>
  );
};
