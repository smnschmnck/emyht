import styles from '../../styles/AtomicError.module.css';

interface ErrorProps {
  errorMessage: string;
}

export const Error: React.FC<ErrorProps> = ({ errorMessage }) => {
  return <p className={styles.errorP}>{errorMessage}</p>;
};
