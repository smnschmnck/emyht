import { ChatInfoHeader } from './ChatInfoHeader';
import { ChatMessageContainer } from './ChatMessageContainer';
import { SendMessageForm } from './SendMessageForm';
import styles from '../styles/ChatViewComponent.module.css';
import ISingleChat from '../interfaces/ISingleChat';

interface ChatViewProps {
  chatID: string;
  closeChat: () => void;
  chatOpened: boolean;
  chats: ISingleChat[];
}

export const ChatView: React.FC<ChatViewProps> = ({
  chatID,
  closeChat,
  chatOpened,
  chats,
}) => {
  const curChat = chats.find((c) => c.chatID === chatID);
  return (
    <div className={styles.mainChat}>
      <ChatInfoHeader
        name={curChat?.chatName ?? ''}
        picUrl={curChat?.pictureUrl}
        close={closeChat}
        info={'12:32'}
      />
      <div className={styles.chatContainer}>
        <div className={styles.messageContainer}>
          <ChatMessageContainer chatID={chatID} chatOpened={chatOpened} />
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
