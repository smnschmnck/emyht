import styles from '../../styles/AtomicModal.module.css';

interface ModalProps {
  children?: React.ReactNode;
  backgroundClickHandler?: () => void;
}

export const Modal: React.FC<ModalProps> = ({
  children,
  backgroundClickHandler: closeHandler,
}) => {
  return (
    <span className={styles.modal}>
      <span className={styles.foreground}>{children}</span>
      <span className={styles.background} onClick={closeHandler}></span>
    </span>
  );
};
