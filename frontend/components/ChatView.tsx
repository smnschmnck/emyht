import { ChatInfoHeader } from './ChatInfoHeader';
import { ChatMessageContainer } from './ChatMessageContainer';
import { SendMessageForm } from './SendMessageForm';
import styles from '../styles/ChatViewComponent.module.css';
import ISingleChat from '../interfaces/ISingleChat';
import { useQuery } from '@tanstack/react-query';

interface ChatViewProps {
  chatID: string;
  closeChat: () => void;
  chatOpened: boolean;
  chats: ISingleChat[];
  openMediaModal: (mediaType: 'image' | 'video', mediaSource: string) => void;
}

interface ChatInfo {
  info: string;
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatID,
  closeChat,
  chatOpened,
  chats,
  openMediaModal,
}) => {
  const chatInfoQuery = useQuery(['chatInfo', chatID], async () => {
    const res = await fetch(`/api/getChatInfo/${chatID}`);
    if (!res.ok) {
      throw new Error(await res.text());
    }
    return (await res.json()) as ChatInfo;
  });
  const chatInfoString = chatInfoQuery.data?.info ?? '';
  const curChat = chats.find((c) => c.chatID === chatID);

  return (
    <div className={styles.mainChat}>
      <ChatInfoHeader
        name={curChat?.chatName ?? ''}
        picUrl={curChat?.pictureUrl}
        close={closeChat}
        info={chatInfoString}
        chatType={curChat?.chatType ?? ''}
      />
      <div className={styles.chatContainer}>
        <div className={styles.messageContainer}>
          <ChatMessageContainer
            openMediaModal={openMediaModal}
            chatID={chatID}
            chatOpened={chatOpened}
          />
        </div>
        <div className={styles.bottomControls}>
          <div className={styles.wrapper}>
            <SendMessageForm chatID={chatID} />
          </div>
        </div>
      </div>
    </div>
  );
};
