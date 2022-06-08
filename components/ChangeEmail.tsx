import { Input } from './atomic/Input';
import styles from '../styles/ChangeEmailComponent.module.css';
import { FormEvent, useState } from 'react';
import { BigButton } from './atomic/Button';

interface ChangeEmailProps {
  setCurEmail: (email: string) => void;
  toggleShowChangeEmail: () => void;
  showEmailSentScreen: () => void;
}

const ChangeEmail: React.FC<ChangeEmailProps> = ({
  setCurEmail,
  toggleShowChangeEmail,
  showEmailSentScreen,
}) => {
  const [error, setError] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');

  const sendChangeRequest = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newEmail !== confirmNewEmail) {
      setError('Emails do not match');
      return;
    }
    const body = {
      newEmail: newEmail,
    };
    const res = await fetch('/api/changeEmail', {
      method: 'post',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setError(await res.text());
      return;
    }
    setCurEmail(newEmail);
    showEmailSentScreen();
  };

  return (
    <div className={styles.main}>
      <h1>Change your E-Mail</h1>
      <form
        onSubmit={sendChangeRequest}
        onChange={() => setError('')}
        className={styles.form}
      >
        <Input
          placeholder="E-Mail"
          required={true}
          autoFocus={true}
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Input
          placeholder="Confirm E-Mail"
          required={true}
          value={confirmNewEmail}
          onChange={(e) => setConfirmNewEmail(e.target.value)}
        />
        <BigButton type="submit">Submit</BigButton>
      </form>
      <p className={styles.errorP}>{error}</p>
      <button className={styles.cancelButton} onClick={toggleShowChangeEmail}>
        Cancel
      </button>
    </div>
  );
};

export default ChangeEmail;
