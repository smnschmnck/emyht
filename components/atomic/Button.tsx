import styles from '../../styles/AtomicButton.module.css';

interface ButtonProps {
  type?: 'submit' | 'button';
  disabled?: boolean;
  onClick?: (...args: any) => any;
  children?: React.ReactNode;
}

export const BigButton: React.FC<ButtonProps> = ({
  type,
  onClick,
  children,
  disabled,
}) => {
  return (
    <button
      type={type}
      className={disabled ? styles.submitButtonDisabled : styles.submitButton}
      onClick={disabled ? undefined : onClick}
    >
      {children}
    </button>
  );
};

export const SmallButton: React.FC<ButtonProps> = ({
  type,
  onClick,
  children,
  disabled,
}) => {
  return (
    <div className={styles.smallButtonContainer}>
      <button
        onClick={disabled ? undefined : onClick}
        type={type}
        className={disabled ? styles.smallButtonDisabled : styles.smallButton}
      >
        {children}
      </button>
    </div>
  );
};
