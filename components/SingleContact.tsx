import styles from '../styles/SingleContactComponent.module.css';
import Image from 'next/image';

export interface SingleContactProps {
  name: string;
  profilePictureUrl: string;
}

export const SingleContact: React.FC<SingleContactProps> = ({
  name,
  profilePictureUrl,
}) => {
  return (
    <div className={styles.contact}>
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
    </div>
  );
};
