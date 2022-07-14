import { Modal } from './atomic/Modal';
import styles from '../styles/ContactRequestModal.module.css';
import { Input } from './atomic/Input';
import { BigButton, SmallButton } from './atomic/Button';

interface ContactRequestModalProps {
  closeHandler: () => void;
}

export const ContactRequestModal: React.FC<ContactRequestModalProps> = ({
  closeHandler,
}) => {
  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h2 className={styles.heading}>Add contact 👋</h2>
          <div className={styles.interactiveContent}>
            <form className={styles.form} onSubmit={(e) => e.preventDefault()}>
              <Input autoFocus placeholder="E-Mail address" />
              <BigButton type="submit">Send</BigButton>
            </form>
            <SmallButton onClick={() => closeHandler()} type="button">
              Cancel
            </SmallButton>
          </div>
        </div>
      </div>
    </Modal>
  );
};
