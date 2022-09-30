import { useQuery } from '@tanstack/react-query';
import { formatPicURL } from '../helpers/stringFormatters';
import IUser from '../interfaces/IUser';
import styles from '../styles/SettingsModal.module.css';
import { BigButton, SmallButton } from './atomic/Button';
import { Modal } from './atomic/Modal';
import { SettingEditor } from './atomic/SettingEditor';
import Image from 'next/image';
import { FilePicker } from './atomic/FilePicker';

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

  return (
    <Modal backgroundClickHandler={closeHandler} mobileFullscreen>
      <div className={styles.main}>
        <div className={styles.header}>
          <h2 className={styles.heading}>Settings</h2>
        </div>
        <div className={styles.allSettings}>
          <div className={styles.userSettings}>
            <h3 className={styles.settingHeading}>User Settings</h3>
            <div className={styles.changePicContainer}>
              <div className={styles.profilePicContainer}>
                <Image
                  src={formatPicURL(user?.profilePictureUrl)}
                  alt="Profile picture"
                  layout="fill"
                />
              </div>
              <FilePicker buttonText="Change Profile Picture" />
            </div>
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
