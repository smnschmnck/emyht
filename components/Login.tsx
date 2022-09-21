import { useFormik } from 'formik';
import { Input, PasswordInput } from './atomic/Input';
import styles from '../styles/LoginRegisterComponent.module.css';
import { BigButton, SmallButton } from './atomic/Button';
import { Error } from './atomic/Error';
import { useMutation } from '@tanstack/react-query';

interface LoginProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: () => void;
}

const Login: React.FC<LoginProps> = (props) => {
  interface ILoginData {
    email: string;
    password: string;
  }

  const sendLogin = useMutation(
    async (loginData: ILoginData) => {
      const res = await fetch('/api/login', {
        method: 'post',
        body: JSON.stringify(loginData),
      });
      if (!res.ok) {
        throw await res.text();
      }
    },
    {
      onSuccess: props.newLogin,
    }
  );

  const formik = useFormik({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: (values) => sendLogin.mutate(values),
  });

  return (
    <div className={styles.content}>
      <h1 className={styles.heading}>Login</h1>
      <form
        onSubmit={formik.handleSubmit}
        autoComplete="off"
        className={styles.form}
        onChange={() => (sendLogin.isError = false)}
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
        <BigButton type="submit" loading={sendLogin.isLoading}>
          Log In
        </BigButton>
      </form>
      {sendLogin.isError && <Error errorMessage={String(sendLogin.error)} />}
      <SmallButton onClick={props.toggleLoginRegister}>Sign Up</SmallButton>
    </div>
  );
};

export default Login;
