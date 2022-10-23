import styles from '../styles/SingleContactComponent.module.css';
import { formatPicURL } from '../helpers/stringFormatters';
import { Avatar } from './atomic/Avatar';

export interface Contact {
  id: string;
  name: string;
  profilePictureUrl?: string;
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
          <Avatar url={formatPicURL(profilePictureUrl)} size={'40px'} />
          <p className={styles.contactName}>{name}</p>
        </div>
      </button>
    </div>
  );
};
