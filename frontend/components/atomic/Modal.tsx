import { createPortal } from 'react-dom';
import styles from '../../styles/AtomicModal.module.css';
import { useEffect, useRef } from 'react';

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

  const modalContentRef = useRef<HTMLSpanElement | null>(null);
  useEffect(() => {
    if (modalContentRef.current) {
      modalContentRef.current.focus();
    }
  }, []);

  return createPortal(
    <span className={styles.modal}>
      <span
        className={styles.foreground}
        id={isMobileFullscreen ? styles.mobileFullscreen : ''}
        ref={modalContentRef}
      >
        {children}
      </span>
      <span
        className={styles.background}
        onClick={backgroundClickHandler}
      ></span>
    </span>,
    document.body
  );
};
