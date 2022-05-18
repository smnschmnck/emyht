import { useFormik } from 'formik';
import { useState } from 'react';
import styles from '../styles/LoginRegisterComponent.module.css';

interface LoginProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: (username: string, email: string) => void;
}

const Login: React.FC<LoginProps> = (props) => {
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    onSubmit: async (values) => {
      const res = await fetch('/api/login', {
        method: 'post',
        body: JSON.stringify(values),
      });
      if (!res.ok) {
        setLoginError(await res.text());
        return;
      }
      loadUser();
    },
  });

  const loadUser = async () => {
    const res = await fetch('/api/user');
    if (!res.ok) {
      setLoginError(await res.text());
      return;
    }
    const json = await res.json();
    props.newLogin(json.username, json.email);
  };

  return (
    <div className={styles.content}>
      <h1>Login</h1>
      <form
        onChange={() => setLoginError('')}
        onSubmit={formik.handleSubmit}
        autoComplete='off'
        className={styles.form}>
        <input
          className={styles.inputField}
          type='text'
          placeholder='Username'
          name='username'
          value={formik.values.username}
          onChange={formik.handleChange}
          autoFocus
          required
        />
        <div className={styles.inputWrapper}>
          <input
            className={styles.innerInput}
            type={showPassword ? 'text' : 'password'}
            placeholder='Password'
            name='password'
            value={formik.values.password}
            onChange={formik.handleChange}
            required
          />
          <button
            className={
              showPassword
                ? styles.hidePasswordButton
                : styles.showPasswordButton
            }
            type='button'
            onClick={() => setShowPassword(!showPassword)}></button>
        </div>
        <button type='submit' className={styles.submitButton}>
          Log In
        </button>
      </form>
      {loginError && <p className={styles.errorP}>{loginError}</p>}
      <div className={styles.switchButtonContainer}>
        <button
          onClick={props.toggleLoginRegister}
          className={styles.switchButton}>
          Sign Up
        </button>
      </div>
    </div>
  );
};

export default Login;
