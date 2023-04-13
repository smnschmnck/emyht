import { BigButton, BigButtonGreyHover, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import styles from '../styles/ConfirmBlockUserModal.module.css';
import { useMutation } from '@tanstack/react-query';
import { ErrorMessage } from './atomic/ErrorMessage';
import { formatError } from '../helpers/stringFormatters';
import { Loader } from './atomic/Loader';
import { useState } from 'react';

interface ConfirmBlockUserModalProps {
  onClose: () => void;
  chatID: string;
  participantUUID?: string;
  name: string;
}

export const ConfirmBlockUserModal: React.FC<ConfirmBlockUserModalProps> = ({
  onClose,
  chatID,
  participantUUID,
  name,
}) => {
  const [success, setSuccess] = useState(false);

  const blockUserMutation = useMutation(
    async () => {
      if (!participantUUID) throw new Error('Could not get participant');

      const body = {
        userID: participantUUID,
        chatID: chatID,
      };

      const res = await fetch('/api/blockUser', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    {
      onSuccess: () => setSuccess(true),
    }
  );

  return (
    <Modal backgroundClickHandler={onClose} mobileFullscreen>
      <div className={styles.container}>
        {!success && (
          <div className={styles.content}>
            <h2 className={styles.heading}>
              Do you really want to block {name}?
            </h2>
            {blockUserMutation.isLoading && (
              <div className={styles.loaderContainer}>
                <div className={styles.loader}>
                  <Loader />
                </div>
              </div>
            )}
            {!blockUserMutation.isLoading && (
              <div className={styles.interactiveContent}>
                {blockUserMutation.isError && (
                  <ErrorMessage
                    errorMessage={formatError(blockUserMutation.error)}
                  />
                )}
                <BigButton
                  variant="destructive"
                  onClick={blockUserMutation.mutate}
                >
                  Block
                </BigButton>
                <SmallButton onClick={onClose}>Cancel</SmallButton>
              </div>
            )}
          </div>
        )}
        {success && (
          <div className={styles.content}>
            <h2 className={styles.heading}>Successfully blocked {name}</h2>
            <BigButton onClick={onClose}>Close</BigButton>
          </div>
        )}
      </div>
    </Modal>
  );
};
