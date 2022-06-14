import styles from '../styles/AddChatModal.module.css';
import Image from 'next/image';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import group from '../assets/images/group.svg';
import chat from '../assets/images/chat.svg';
import { ContactList } from './ContactList';

interface AddChatModalProps {
  closeHandler: () => void;
}

export const AddChatModal: React.FC<AddChatModalProps> = ({ closeHandler }) => {
  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
      <div className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.heading}>New chat</h2>
        </div>
        <div className={styles.interface}>
          {/* TODO: Refactor into atomic component */}
          <div className={styles.selector}>
            <button className={styles.selectorElement} id={styles.active}>
              <div className={styles.selectorLabel}>
                <Image src={chat} alt="group" objectFit={'contain'}></Image>
                <p className={styles.selectorLabelText}>Chat</p>
              </div>
            </button>
            <button className={styles.selectorElement}>
              <div className={styles.selectorLabel}>
                <Image src={group} alt="group"></Image>
                <p className={styles.selectorLabelText}>Group</p>
              </div>
            </button>
          </div>
          <ContactList />
          <div className={styles.buttons}>
            <BigButton>Start chat</BigButton>
            <SmallButton onClick={closeHandler}>Cancel</SmallButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};
