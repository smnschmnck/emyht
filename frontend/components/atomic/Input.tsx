import { HTMLInputTypeAttribute, useState } from 'react';
import styles from '../../styles/AtomicInput.module.css';

interface PasswordInputProps {
  placeholder?: string;
  name?: string;
  value?: string;
  onChange?: (args: any) => any;
  required?: boolean;
  autoFocus?: boolean;
}

interface InputProps extends PasswordInputProps {
  type?: HTMLInputTypeAttribute;
}

export const Input: React.FC<InputProps> = ({
  type,
  placeholder,
  name,
  value,
  onChange,
  required,
  autoFocus,
}) => {
  return (
    <input
      className={styles.inputField}
      type={type}
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      autoFocus={autoFocus}
    />
  );
};

export const PasswordInput: React.FC<PasswordInputProps> = ({
  placeholder,
  name,
  value,
  onChange,
  required,
  autoFocus,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className={styles.inputWrapper}>
      <input
        className={styles.innerInput}
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        autoFocus={autoFocus}
      />
      <button
        className={
          showPassword ? styles.hidePasswordButton : styles.showPasswordButton
        }
        type="button"
        onClick={() => setShowPassword(!showPassword)}
      ></button>
    </div>
  );
};
