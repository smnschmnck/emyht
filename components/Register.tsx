import { useFormik } from 'formik';
import { useState } from 'react';
import styles from '../styles/LoginRegisterComponent.module.css';
import { BigButton, SmallButton } from './atomic/Button';
import { Input, PasswordInput } from './atomic/Input';

interface RegisterProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: (email: string, username: string) => void;
}

const Register: React.FC<RegisterProps> = (props) => {
  const [loginError, setLoginError] = useState('');
  const [passwordRepeat, setPasswordReapeat] = useState('');
  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: '',
    },
    onSubmit: async (values) => {
      if (values.password !== passwordRepeat) {
        setLoginError('Passwords do not match');
        return;
      }
      if (values.password.length < 8) {
        setLoginError('Password must be longer than 8 characters');
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
      <h1 className={styles.heading}>Register</h1>
      <form
        onChange={() => setLoginError('')}
        onSubmit={formik.handleSubmit}
        className={styles.form}
        autoComplete="off"
      >
        <Input
          type={'text'}
          placeholder={'E-Mail'}
          name={'email'}
          value={formik.values.email}
          onChange={formik.handleChange}
          required={true}
          autoFocus={true}
        />
        <Input
          type={'text'}
          placeholder={'Username'}
          name={'username'}
          value={formik.values.username}
          onChange={formik.handleChange}
          required={true}
        />
        <PasswordInput
          placeholder={'Password'}
          name={'password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          required={true}
        />
        <PasswordInput
          placeholder={'Repeat Password'}
          value={passwordRepeat}
          onChange={(e) => setPasswordReapeat(e.target.value)}
          required={true}
        />
        <BigButton type="submit">Register</BigButton>
      </form>
      {loginError && <p className={styles.errorP}>{loginError}</p>}
      <SmallButton onClick={props.toggleLoginRegister}>Log In</SmallButton>
    </div>
  );
};

export default Register;
