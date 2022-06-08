import styles from '../../styles/AtomicButton.module.css';

interface ButtonProps {
  type?: 'submit' | 'button';
  onClick?: (...args: any) => any;
  children?: React.ReactNode;
}

export const BigButton: React.FC<ButtonProps> = ({
  type,
  onClick,
  children,
}) => {
  return (
    <button type={type} className={styles.submitButton} onClick={onClick}>
      {children}
    </button>
  );
};

export const SmallButton: React.FC<ButtonProps> = ({
  type,
  onClick,
  children,
}) => {
  return (
    <div className={styles.smallButtonContainer}>
      <button onClick={onClick} type={type} className={styles.smallButton}>
        {children}
      </button>
    </div>
  );
};
