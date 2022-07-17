import { ContactRequest } from './Chats';
import { SingleContactRequest } from './SingleContactRequest';
import styles from '../styles/ContactRequests.module.css';

interface ContactRequestsProps {
  contactRequests: ContactRequest[];
}

export const ContactRequests: React.FC<ContactRequestsProps> = ({
  contactRequests,
}) => {
  return (
    <div className={styles.main}>
      <h2 className={styles.heading}>Contact Requests</h2>
      <div className={styles.requestsContainer}>
        {contactRequests.map((r) => (
          <SingleContactRequest
            key={r.senderID}
            senderID={r.senderID}
            senderUsername={r.senderUsername}
            senderProfilePicture={r.senderProfilePicture}
          />
        ))}
      </div>
    </div>
  );
};
