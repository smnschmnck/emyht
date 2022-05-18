import { useFormik } from 'formik';
import { useState } from 'react';
import styles from '../styles/LoginRegisterComponent.module.css';

interface RegisterProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: (username: string, email: string) => void;
}

const Register: React.FC<RegisterProps> = (props) => {
  const [loginError, setLoginError] = useState('');
  const [passwordRepeat, setPasswordReapeat] = useState('');
  const formik = useFormik({
    initialValues: {
      username: '',
      email: '',
      password: '',
    },
    onSubmit: async (values) => {
      if (values.password !== passwordRepeat) {
        setLoginError('Passwords do not match');
        return;
      }
      const res = await fetch('/api/register', {
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
      <h1>Register</h1>
      <form
        onChange={() => setLoginError('')}
        onSubmit={formik.handleSubmit}
        className={styles.form}
        autoComplete='off'>
        <input
          className={styles.inputField}
          type='text'
          placeholder='Username'
          name='username'
          value={formik.values.username}
          onChange={formik.handleChange}
          required
          autoFocus
        />
        <input
          className={styles.inputField}
          type='text'
          placeholder='E-Mail'
          name='email'
          value={formik.values.email}
          onChange={formik.handleChange}
          required
        />
        <input
          className={styles.inputField}
          type='password'
          placeholder='Password'
          name='password'
          value={formik.values.password}
          onChange={formik.handleChange}
          required
        />
        <input
          className={styles.inputField}
          type='password'
          placeholder='Repeat Password'
          name='passwordRepeat'
          value={passwordRepeat}
          onChange={(e) => setPasswordReapeat(e.target.value)}
          required
        />
        <button type='submit' className={styles.submitButton}>
          Register
        </button>
      </form>
      {loginError && <p className={styles.errorP}>{loginError}</p>}
      <div className={styles.switchButtonContainer}>
        <button
          onClick={props.toggleLoginRegister}
          className={styles.switchButton}>
          Log In
        </button>
      </div>
    </div>
  );
};

export default Register;
