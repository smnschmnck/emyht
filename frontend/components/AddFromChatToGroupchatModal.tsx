import styles from '../styles/AddToGroupchatModal.module.css';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Loader } from './atomic/Loader';
import { SingleContactOrChat } from './SingleContactOrChat';
import { Input } from './atomic/Input';
import { ErrorMessage } from './atomic/ErrorMessage';
import { formatError } from '../helpers/stringFormatters';

interface AddToGroupchatModalProps {
  chatID: string;
  username: string;
  closeHandler: () => void;
}

interface SimpleChat {
  chatID: string;
  chatName: string;
  pictureUrl: string;
}

export const AddToGroupchatsModal: React.FC<AddToGroupchatModalProps> = ({
  chatID,
  username,
  closeHandler,
}) => {
  const [success, setSuccess] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  type participantData = { participantUUID: string };
  const { data: participantQueryData, isLoading: isLoadingParticipantUUID } =
    useQuery<participantData>(
      [`oneOnOneChatParticipantUUID/${chatID}`],
      async () => {
        const res = await fetch(`/api/getOneOnOneChatParticipant/${chatID}`);
        return (await res.json()) as participantData;
      }
    );

  const { data: chatQueryData, isLoading: isLoadingChats } = useQuery<
    SimpleChat[]
  >(
    [`chatsNewUserIsNotPartOf/${participantQueryData?.participantUUID}`],
    async () => {
      const body = { newUserID: participantQueryData?.participantUUID };

      const res = await fetch('/api/getGroupchatsNewUserIsNotPartOf', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      return (await res.json()) as SimpleChat[];
    },
    { enabled: !!participantQueryData?.participantUUID }
  );
  const chats = chatQueryData ?? [];

  const addUserMutation = useMutation(
    async () => {
      const body = {
        chatIDs: selectedChats,
        participantUUID: participantQueryData?.participantUUID,
      };

      const res = await fetch('/api/addSingleUserToGroupChats', {
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

  const selectChat = (id: string) => {
    if (selectedChats.includes(id)) {
      setSelectedChats(selectedChats.filter((chatID) => chatID !== id));
      return;
    }

    setSelectedChats([...selectedChats, id]);
  };

  const getFilteredChats = () => {
    return chats.filter(
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
            <h2 className={styles.heading}>Add to Groupchats</h2>
          </div>
          {isLoadingChats && (
            <div className={styles.loaderContainer}>
              <div className={styles.loader}>
                <Loader />
              </div>
            </div>
          )}
          {chats.length <= 0 && !isLoadingChats && (
            <div className={styles.noChatInfo}>
              <div></div>
              <div>
                <span className={styles.emoji}>🤷</span>
                <h2
                  className={styles.noChatText}
                >{`You don't have any groupchats ${username} is not part of`}</h2>
              </div>
              <BigButton onClick={closeHandler}>Close</BigButton>
            </div>
          )}
          {chats.length > 0 && (
            <div className={styles.interface}>
              <Input
                placeholder="Search Chats"
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
              <>
                {addUserMutation.error && (
                  <ErrorMessage
                    errorMessage={formatError(addUserMutation.error)}
                  />
                )}
              </>
              <div className={styles.buttons}>
                <BigButton onClick={addUserMutation.mutate}>
                  Add to chat
                </BigButton>
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
