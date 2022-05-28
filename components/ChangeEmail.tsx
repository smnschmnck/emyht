import { Input } from './atomic/Input';
import styles from '../styles/ChangeEmailComponent.module.css';

interface ChangeEmailProps {
  toggleShowChangeEmail: () => void;
  sendEmail: () => void;
}

const ChangeEmail: React.FC<ChangeEmailProps> = ({
  toggleShowChangeEmail,
  sendEmail,
}) => {
  return (
    <div className={styles.main}>
      <h1>Change your E-Mail</h1>
      <form onSubmit={(e) => e.preventDefault()} className={styles.form}>
        <Input placeholder='E-Mail' />
        <Input placeholder='Confirm E-Mail' />
        <button
          type='submit'
          className={styles.submitButton}
          onClick={sendEmail}>
          Submit
        </button>
      </form>
      <button className={styles.cancelButton} onClick={toggleShowChangeEmail}>
        Cancel
      </button>
    </div>
  );
};

export default ChangeEmail;
