import styles from '../styles/UserInfoAndSettingsComponent.module.css';
import more from '../assets/images/more.svg';
import logout from '../assets/images/logout.svg';
import Image from 'next/image';
import Logout from './Logout';
import { useQuery } from '@tanstack/react-query';
import IUser from '../interfaces/IUser';

const UserInfoAndSettings: React.FC = ({}) => {
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;
  return (
    <div className={styles.settingsContainer}>
      <div className={styles.infoContainer}>
        <h3 className={styles.usernameH3}>{user?.username ?? 'Error'}</h3>
        <p className={styles.emailP}>{user?.email ?? 'Error'}</p>
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
