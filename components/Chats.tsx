import styles from '../styles/ChatsComponent.module.css';
import plus from '../assets/images/plus.svg';
import { Input } from './atomic/Input';
import Image from 'next/image';
import SingleChat from './SingleChat';
import dummy from '../assets/images/dummypp.jpeg';

const Chats: React.FC = () => {
  return (
    <div className={styles.todo}>
      <div className={styles.controls}>
        <div className={styles.chatContainer}>
          <div className={styles.chatsHeader}>
            <h2>Chats</h2>
            <button className={styles.addChatButton}>
              <Image src={plus} alt="Add Chat" />
            </button>
          </div>
          <Input placeholder="Search Chats"></Input>
        </div>
      </div>
      <div className={styles.chats}>
        <SingleChat
          name={'Maximilian Berger'}
          time={'17:32'}
          message={"Yeah I've been thinking the same"}
          read={false}
          profilePictureUrl={dummy.src}
        />
        <SingleChat
          name={'Sarah Parker'}
          time={'17:12'}
          message={'Thanks!'}
          read={true}
        />
      </div>
    </div>
  );
};

export default Chats;
