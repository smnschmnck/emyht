import styles from '../../styles/AtomicButton.module.css';

interface ButtonProps {
  type?: 'submit' | 'button';
  disabled?: boolean;
  onClick?: (...args: any) => any;
  color?: string;
  children?: React.ReactNode;
  loading?: boolean;
  variant?: 'destructive' | 'confirm';
}

export const BigButton: React.FC<ButtonProps> = ({
  type,
  onClick,
  children,
  disabled,
  color,
  loading,
  variant,
}) => {
  return (
    <button
      style={{ color: color }}
      type={type}
      className={
        variant == 'destructive'
          ? styles.destructiveButton
          : styles.submitButton
      }
      id={disabled || loading ? styles.disabled : styles.enabled}
      disabled={disabled || loading}
      onClick={onClick}
    >
      <span className={styles.submitButtonContent}>
        {loading && <div className={styles.circle} />}
        <span className={styles.submitButtonText}>{children}</span>
        {loading && <div className={styles.spacer} />}
      </span>
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
