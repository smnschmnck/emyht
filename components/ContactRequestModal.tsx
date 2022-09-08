import { Modal } from './atomic/Modal';
import styles from '../styles/ContactRequestModal.module.css';
import { Input } from './atomic/Input';
import { BigButton, SmallButton } from './atomic/Button';
import { FormEvent, useState } from 'react';
import { Error } from './atomic/Error';

interface ContactRequestModalProps {
  closeHandler: () => void;
}

export const ContactRequestModal: React.FC<ContactRequestModalProps> = ({
  closeHandler,
}) => {
  const [email, setEmail] = useState('');
  const [requestSuccess, setrequestSuccess] = useState(false);
  const [requestError, setRequestError] = useState('');

  const submitHandler = async (e: FormEvent) => {
    e.preventDefault();
    const body = {
      contactEmail: email,
    };
    const res = await fetch('/api/sendContactRequest', {
      method: 'post',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      setRequestError(await res.text());
      return;
    }
    setrequestSuccess(true);
  };

  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen={true}>
      <div className={styles.container}>
        {!requestSuccess && (
          <div className={styles.content}>
            <h2 className={styles.heading}>Add contact 👋</h2>
            <div className={styles.interactiveContent}>
              <form
                className={styles.form}
                onSubmit={submitHandler}
                onChange={() => setRequestError('')}
              >
                <Input
                  autoFocus
                  placeholder="E-Mail address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                />
                <BigButton type="submit">Send</BigButton>
              </form>
              {requestError && <Error errorMessage={requestError} />}
              <SmallButton onClick={() => closeHandler()} type="button">
                Cancel
              </SmallButton>
            </div>
          </div>
        )}
        {requestSuccess && (
          <div className={styles.success}>
            <h2 className={styles.successMessage}>
              Request sent successfully 🥳
            </h2>
            <BigButton onClick={() => closeHandler()}>Close</BigButton>
          </div>
        )}
      </div>
    </Modal>
  );
};
