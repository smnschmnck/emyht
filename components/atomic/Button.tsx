import styles from '../../styles/AtomicButton.module.css';

interface ButtonProps {
  type?: 'submit' | 'button';
  disabled?: boolean;
  onClick?: (...args: any) => any;
  color?: string;
  children?: React.ReactNode;
}

export const BigButton: React.FC<ButtonProps> = ({
  type,
  onClick,
  children,
  disabled,
  color,
}) => {
  return (
    <button
      style={{ color: color }}
      type={type}
      className={disabled ? styles.submitButtonDisabled : styles.submitButton}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export const BigButtonGreyHover: React.FC<ButtonProps> = ({
  type,
  onClick,
  children,
  disabled,
  color,
}) => {
  return (
    <button
      style={{ color: disabled ? 'var(--grey)' : color }}
      type={type}
      className={
        disabled ? styles.bigButtonGreyHoverDisabled : styles.bigButtonGreyHover
      }
      disabled={disabled}
      onClick={onClick}
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
  color,
}) => {
  return (
    <div className={styles.smallButtonContainer}>
      <button
        style={{ color: color }}
        disabled={disabled}
        onClick={onClick}
        type={type}
        className={disabled ? styles.smallButtonDisabled : styles.smallButton}
      >
        {children}
      </button>
    </div>
  );
};
