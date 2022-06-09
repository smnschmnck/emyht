import styles from '../styles/UserInfoAndSettingsComponent.module.css';
import more from '../assets/images/more.svg';
import logout from '../assets/images/logout.svg';
import Image from 'next/image';
import Logout from './Logout';

interface UserInfoAndSettingsProps {
  username: string;
  email: string;
}

const UserInfoAndSettings: React.FC<UserInfoAndSettingsProps> = ({
  username,
  email,
}) => {
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.infoContainer}>
        <h3 className={styles.usernameH3}>{username}</h3>
        <p className={styles.emailP}>{email}</p>
      </div>
      <button className={styles.actionButton} title="Settings">
        <Image src={more} alt="settings" />
      </button>
      <Logout className={styles.actionButton}>
        <Image src={logout} alt="logout" />
      </Logout>
    </div>
  );
};

export default UserInfoAndSettings;
