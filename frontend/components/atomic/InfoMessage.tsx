import styles from '../../styles/AtomicInfo.module.css';
import Image from 'next/image';
import info from '../../assets/images/info.svg';

interface InfoMessageProps {
  infoMessage: string;
}

export const InfoMessage: React.FC<InfoMessageProps> = ({ infoMessage }) => {
  return (
    <div className={styles.infoContainer}>
      <div className={styles.infoContent}>
        <Image src={info} alt="Warning" />
        <p className={styles.infoP}>{infoMessage}</p>
      </div>
    </div>
  );
};
