import styles from '../styles/SettingsModal.module.css';
import { SmallButton } from './atomic/Button';
import { InfoMessage } from './atomic/InfoMessage';
import { Modal } from './atomic/Modal';
import { UserSettings } from './UserSettings';

interface SettingsModalProps {
  closeHandler: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  closeHandler,
}) => {
  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen>
      <div className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Settings</h2>
        </div>
        <div className={styles.allSettings}>
          <UserSettings />
        </div>
        <div className={styles.footer}>
          <SmallButton onClick={closeHandler}>Close</SmallButton>
        </div>
      </div>
    </Modal>
  );
};
