import styles from '../styles/SingleContactComponent.module.css';
import Image from 'next/image';
import { url } from 'inspector';

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
  const formatPicURL = (profilePictureUrl: string) => {
    const defaultPpRegeEx = /^default_[0-9]$/i;
    if (profilePictureUrl.match(defaultPpRegeEx)) {
      const num = profilePictureUrl.replace('default_', '');
      return '/default_profile_pictures/default_' + num + '.png';
    }
    return profilePictureUrl;
  };

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
                src={formatPicURL(profilePictureUrl)}
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
