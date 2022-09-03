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
}) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.error}>{error}</p>
      <form className={styles.form} onSubmit={submitHandler}>
        <input
          type="text"
          placeholder={inputPlaceHolder}
          className={styles.input}
          id={buttonDisabled || error ? styles.isError : ''}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus={autofocus}
        />
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
