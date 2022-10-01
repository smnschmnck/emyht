import { useQuery } from '@tanstack/react-query';
import IUser from '../interfaces/IUser';
import styles from '../styles/SettingsModal.module.css';
import { SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { SettingEditor } from './atomic/SettingEditor';
import { ProfilePicChanger } from './ProfilePicChanger';

interface SettingsModalProps {
  closeHandler: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  closeHandler,
}) => {
  const userQuery = useQuery<IUser>(['user'], async () => {
    const res = await fetch('/api/user');
    return (await res.json()) as IUser;
  });
  const user = userQuery.data;
  const profilePicUrl = user?.profilePictureUrl;

  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen>
      <div className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Settings</h2>
        </div>
        <div className={styles.allSettings}>
          <div className={styles.userSettings}>
            <h3 className={styles.settingHeading}>User Settings</h3>
            <ProfilePicChanger profilePicUrl={profilePicUrl} />
            <SettingEditor
              settingName={'Username'}
              settingValue={user?.username ?? ''}
              changeHandler={(newVal) => alert('CHANGED TO: ' + newVal)}
            />
            <SettingEditor
              settingName={'E-Mail'}
              settingValue={user?.email ?? ''}
              changeHandler={(newVal) => alert('CHANGED TO: ' + newVal)}
            />
          </div>
        </div>
        <SmallButton onClick={closeHandler}>Close</SmallButton>
      </div>
    </Modal>
  );
};
