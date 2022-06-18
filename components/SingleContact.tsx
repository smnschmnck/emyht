import styles from '../styles/SingleContactComponent.module.css';
import Image from 'next/image';

export interface Contact {
  id: string;
  name: string;
  profilePictureUrl: string;
}

interface SingleContactProps extends Contact {
  selectContact: (id: string) => void;
  selected: boolean;
}

export const SingleContact: React.FC<SingleContactProps> = ({
  id,
  name,
  profilePictureUrl,
  selectContact,
  selected,
}) => {
  return (
    <div className={styles.contact}>
      <button
        className={styles.contactWrapper}
        id={selected ? styles.selected : ''}
        onClick={() => selectContact(id)}
      >
        <div className={styles.contactInfo}>
          <div className={styles.profilePicContainer}>
            <div className={styles.profilePic}>
              <Image
                src={profilePictureUrl}
                alt="Profile picture"
                layout="fill"
                objectFit="cover"
              ></Image>
            </div>
          </div>
          <p className={styles.contactName}>{name}</p>
        </div>
      </button>
    </div>
  );
};
