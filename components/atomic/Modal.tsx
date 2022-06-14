import styles from '../../styles/AtomicModal.module.css';

interface ModalProps {
  children?: React.ReactNode;
  backgroundClickHandler?: () => void;
  mobileFullscreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  backgroundClickHandler,
  mobileFullscreen,
}) => {
  const isMobileFullscreen = mobileFullscreen ?? false;
  return (
    <span className={styles.modal}>
      <span
        className={styles.foreground}
        id={isMobileFullscreen ? styles.mobileFullscreen : ''}
      >
        {children}
      </span>
      <span
        className={styles.background}
        onClick={backgroundClickHandler}
      ></span>
    </span>
  );
};
