import { ContactRequest } from './Chats';
import { SingleContactRequest } from './SingleContactRequest';
import styles from '../styles/ContactRequests.module.css';

interface ContactRequestsProps {
  contactRequests: ContactRequest[];
  openContactRequest: (contactRequestID: string) => void;
  handledContactReqs: string[];
}

export const ContactRequests: React.FC<ContactRequestsProps> = ({
  contactRequests,
  openContactRequest,
  handledContactReqs,
}) => {
  return (
    <div className={styles.main}>
      <h2 className={styles.heading}>Contact Requests</h2>
      <div className={styles.requestsContainer}>
        {contactRequests
          .filter((r) => !handledContactReqs.includes(r.senderID))
          .map((r) => (
            <SingleContactRequest
              key={r.senderID}
              senderID={r.senderID}
              senderUsername={r.senderUsername}
              senderProfilePicture={r.senderProfilePicture}
              openContactRequest={openContactRequest}
            />
          ))}
      </div>
    </div>
  );
};
