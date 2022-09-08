import styles from '../../styles/AtomicError.module.css';
import Image from 'next/image';
import warning from '../../assets/images/warning.svg';

interface ErrorProps {
  errorMessage: string;
}

export const Error: React.FC<ErrorProps> = ({ errorMessage }) => {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorContent}>
        <Image src={warning} alt="Warning" />
        <p className={styles.errorP}>{errorMessage}</p>
      </div>
    </div>
  );
};
