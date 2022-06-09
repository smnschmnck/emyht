import { useState } from 'react';
import styles from '../../styles/AtomicInputWithButton.module.css';

interface InputWithButtonProps {
  buttonText: string;
  inputPlaceHolder: string;
  value: string;
  setValue: (...args: any) => void;
  submitHandler: (...args: any) => any;
}

export const InputWithButton: React.FC<InputWithButtonProps> = ({
  buttonText,
  inputPlaceHolder,
  value,
  setValue,
  submitHandler,
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
      <button type="submit" className={styles.button}>
        {buttonText}
      </button>
    </form>
  );
};
