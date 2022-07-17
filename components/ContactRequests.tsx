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
        {[
          {
            senderID: '1',
            senderUsername: 'Anke Schmeinck',
            senderProfilePicture: 'b',
          },
          {
            senderID: '2',
            senderUsername: 'Christof Schmeinck',
            senderProfilePicture: 'b',
          },
          {
            senderID: '3',
            senderUsername: 'Johannes Schmeinck',
            senderProfilePicture: 'b',
          },
          {
            senderID: '4',
            senderUsername: 'Bernd Westphal',
            senderProfilePicture: 'b',
          },
        ].map((r) => (
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
