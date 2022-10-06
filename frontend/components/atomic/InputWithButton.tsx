import styles from '../../styles/AtomicInputWithButton.module.css';

interface InputWithButtonProps {
  buttonText: string;
  inputPlaceHolder: string;
  value: string;
  setValue: (...args: any) => void;
  submitHandler: (...args: any) => any;
  buttonDisabled?: boolean;
  autofocus?: boolean;
  error?: string;
  children?: React.ReactNode;
}

export const InputWithButton: React.FC<InputWithButtonProps> = ({
  buttonText,
  inputPlaceHolder,
  value,
  setValue,
  submitHandler,
  buttonDisabled,
  autofocus,
  error,
  children,
}) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.error}>{error}</p>
      <form className={styles.form} onSubmit={submitHandler}>
        <div className={styles.inputWrapper} id={error ? styles.isError : ''}>
          {children}
          <input
            type="text"
            placeholder={inputPlaceHolder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            autoFocus={autofocus}
            className={styles.input}
          />
        </div>
        <button
          type="submit"
          className={styles.button}
          id={buttonDisabled || error ? styles.buttonDisabled : ''}
          disabled={buttonDisabled || !!error}
        >
          {buttonText}
        </button>
      </form>
    </div>
  );
};
