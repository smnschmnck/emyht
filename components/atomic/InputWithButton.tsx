import styles from '../../styles/AtomicInputWithButton.module.css';

interface InputWithButtonProps {
  buttonText: string;
  inputPlaceHolder: string;
  value: string;
  setValue: (...args: any) => void;
  submitHandler: (...args: any) => any;
  buttonDisabled?: boolean;
}

export const InputWithButton: React.FC<InputWithButtonProps> = ({
  buttonText,
  inputPlaceHolder,
  value,
  setValue,
  submitHandler,
  buttonDisabled,
}) => {
  return (
    <form className={styles.form} onSubmit={submitHandler}>
      <input
        type="text"
        placeholder={inputPlaceHolder}
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <button
        type="submit"
        className={styles.button}
        id={buttonDisabled ? styles.buttonDisabled : ''}
        disabled={buttonDisabled}
      >
        {buttonText}
      </button>
    </form>
  );
};
