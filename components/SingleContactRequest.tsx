import styles from '../styles/SingleContactRequestComponent.module.css';

interface SingleContactRequestProps {
  senderID: string;
  senderUsername: string;
  senderProfilePicture: string;
}

export const SingleContactRequest: React.FC<SingleContactRequestProps> = ({
  senderID,
  senderUsername,
  senderProfilePicture,
}) => {
  return (
    <button className={styles.container}>
      <div className={styles.upper}>
        <div className={styles.profilePic}></div>
      </div>
      <div className={styles.lower}>
        <h3 className={styles.name}>{senderUsername}</h3>
      </div>
    </button>
  );
};
