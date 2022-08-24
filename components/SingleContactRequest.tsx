import { formatPicURL } from '../helpers/stringFormatters';
import styles from '../styles/SingleContactRequestComponent.module.css';
import Image from 'next/image';

interface SingleContactRequestProps {
  senderID: string;
  senderUsername: string;
  senderProfilePicture?: string;
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
        <div className={styles.profilePicture}>
          <div className={styles.image}>
            <Image
              src={formatPicURL(senderProfilePicture)}
              objectFit="cover"
              alt="pp"
              layout="fill"
            />
          </div>
        </div>
      </div>
      <div className={styles.lower}>
        <h3 className={styles.name}>{senderUsername}</h3>
      </div>
    </button>
  );
};
