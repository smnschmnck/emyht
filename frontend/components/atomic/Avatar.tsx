import Image from 'next/image';
import styles from '../../styles/AtomicAvatar.module.css';

interface AvatarProps {
  url: string;
  size?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ url, size }) => {
  size ??= '40px';
  return (
    <div className={styles.profilePicContainer} style={{ width: size }}>
      <div className={styles.profilePic}>
        <Image
          src={url}
          alt="Profile picture"
          layout="fill"
          objectFit="cover"
        />
      </div>
    </div>
  );
};
