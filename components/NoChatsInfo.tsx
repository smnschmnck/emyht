import styles from '../styles/NoChatsInfoComponent.module.css';
import { BigButton } from './atomic/Button';

interface NoChatsInfoProps {
  setShowAddChatModal: (show: boolean) => void;
}

export const NoChatsInfo: React.FC<NoChatsInfoProps> = ({
  setShowAddChatModal,
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <h1>{"You currently don't have any chats 😳"}</h1>
        <BigButton onClick={() => setShowAddChatModal(true)}>
          Start a new Chat
        </BigButton>
      </div>
    </div>
  );
};
