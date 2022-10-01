import Image from 'next/image';
import { FilePicker } from './atomic/FilePicker';
import { formatPicURL } from '../helpers/stringFormatters';
import styles from '../styles/ProfilePicChanger.module.css';
import { useState } from 'react';

interface ProfilePicChangerProps {
  profilePicUrl?: string;
}

export const ProfilePicChanger: React.FC<ProfilePicChangerProps> = ({
  profilePicUrl,
}) => {
  const [curProfilePicURL, setCurProfilePicURL] = useState(profilePicUrl);

  const profilePicChangeHandler = (file: File) => {
    setCurProfilePicURL(URL.createObjectURL(file));
  };

  return (
    <div className={styles.changePicContainer}>
      <div className={styles.profilePicContainer}>
        <Image
          src={formatPicURL(curProfilePicURL)}
          alt="Profile picture"
          layout="fill"
        />
      </div>
      <FilePicker
        buttonText="Change Profile Picture"
        handleFileChange={profilePicChangeHandler}
      />
    </div>
  );
};
