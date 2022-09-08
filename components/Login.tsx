import { useFormik } from 'formik';
import { useState } from 'react';
import { Input, PasswordInput } from './atomic/Input';
import styles from '../styles/LoginRegisterComponent.module.css';
import { BigButton, SmallButton } from './atomic/Button';
import { Error } from './atomic/Error';

interface LoginProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: () => void;
}

const Login: React.FC<LoginProps> = (props) => {
  const [loginError, setLoginError] = useState('');
  const formik = useFormik({
    initialValues: {
      email: '',
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
      props.newLogin();
    },
  });

  return (
    <div className={styles.content}>
      <h1 className={styles.heading}>Login</h1>
      <form
        onChange={() => setLoginError('')}
        onSubmit={formik.handleSubmit}
        autoComplete="off"
        className={styles.form}
      >
        <Input
          type={'email'}
          placeholder={'E-Mail'}
          name={'email'}
          value={formik.values.email}
          onChange={formik.handleChange}
          required={true}
          autoFocus={true}
        />
        <PasswordInput
          placeholder={'Password'}
          name={'password'}
          value={formik.values.password}
          onChange={formik.handleChange}
          required={true}
          autoFocus={false}
        />
        <BigButton type="submit">Log In</BigButton>
      </form>
      {loginError && <Error errorMessage={loginError} />}
      <SmallButton onClick={props.toggleLoginRegister}>Sign Up</SmallButton>
    </div>
  );
};

export default Login;
