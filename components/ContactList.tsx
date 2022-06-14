import { Input } from './atomic/Input';
import styles from '../styles/ContactListComponent.module.css';

export const ContactList: React.FC = () => {
  return (
    <>
      <Input placeholder="Search contacts"></Input>
      <div className={styles.contacts}>
        {/* TODO: Refactor into component */}
        <div className={styles.contact}>
          <div className={styles.contactInfo}>
            <div className={styles.profilePicContainer}>
              <div className={styles.profilePic}></div>
            </div>
            <p className={styles.contactName}>Maximilian Berger</p>
          </div>
        </div>
        <div className={styles.contact}>
          <div className={styles.contactInfo}>
            <div className={styles.profilePicContainer}>
              <div className={styles.profilePic}></div>
            </div>
            <p className={styles.contactName}>Maximilian Berger</p>
          </div>
        </div>
        <div className={styles.contact}>
          <div className={styles.contactInfo}>
            <div className={styles.profilePicContainer}>
              <div className={styles.profilePic}></div>
            </div>
            <p className={styles.contactName}>Maximilian Berger</p>
          </div>
        </div>
        <div className={styles.contact}>
          <div className={styles.contactInfo}>
            <div className={styles.profilePicContainer}>
              <div className={styles.profilePic}></div>
            </div>
            <p className={styles.contactName}>Maximilian Berger</p>
          </div>
        </div>
        <div className={styles.contact}>
          <div className={styles.contactInfo}>
            <div className={styles.profilePicContainer}>
              <div className={styles.profilePic}></div>
            </div>
            <p className={styles.contactName}>Maximilian Berger</p>
          </div>
        </div>
      </div>
    </>
  );
};
