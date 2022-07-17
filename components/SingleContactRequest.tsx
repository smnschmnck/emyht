import styles from '../styles/SingleContactRequestComponent.module.css';

interface SingleContactRequestProps {
  senderID: string;
  senderUsername: string;
  senderProfilePicture: string;
  openContactRequest: (contactRequestID: string) => void;
}

export const SingleContactRequest: React.FC<SingleContactRequestProps> = ({
  senderID,
  senderUsername,
  senderProfilePicture,
  openContactRequest,
}) => {
  return (
    <button
      className={styles.container}
      onClick={() => openContactRequest(senderID)}
    >
      <div className={styles.upper}>
        <div className={styles.profilePic}></div>
      </div>
      <div className={styles.lower}>
        <h3 className={styles.name}>{senderUsername}</h3>
      </div>
    </button>
  );
};
