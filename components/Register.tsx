import { useMutation } from '@tanstack/react-query';
import { useFormik } from 'formik';
import { useState } from 'react';
import { formatError } from '../helpers/stringFormatters';
import styles from '../styles/LoginRegisterComponent.module.css';
import { BigButton, SmallButton } from './atomic/Button';
import { ErrorMessage } from './atomic/ErrorMessage';
import { Input, PasswordInput } from './atomic/Input';

interface RegisterProps {
  showLogin: boolean;
  setShowLogin: (showLogin: boolean) => void;
  showRegister: boolean;
  setShowRegister: (showRegister: boolean) => void;
  toggleLoginRegister: () => void;
  newLogin: () => void;
}

const Register: React.FC<RegisterProps> = (props) => {
  const [passwordRepeat, setPasswordReapeat] = useState('');

  interface IRegistrationData {
    email: string;
    username: string;
    password: string;
  }

  const sendRegistration = useMutation(
    async (registrationData: IRegistrationData) => {
      if (registrationData.password !== passwordRepeat) {
        throw 'Passwords do not match';
      }
      if (registrationData.password.length < 8) {
        throw 'Password must be longer than 8 characters';
      }
      const res = await fetch('/api/register', {
        method: 'post',
        body: JSON.stringify(registrationData),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    {
      onSuccess: props.newLogin,
      retry: 3,
    }
  );

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      password: '',
    },
    onSubmit: (values) => sendRegistration.mutate(values),
  });

  return (
    <>
      {sendRegistration.isSuccess && <h1>Account created 🥳</h1>}
      {!sendRegistration.isSuccess && (
        <div className={styles.content}>
          <h1 className={styles.heading}>Register</h1>
          <form
            onSubmit={formik.handleSubmit}
            className={styles.form}
            autoComplete="off"
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
            <BigButton type="submit" loading={sendRegistration.isLoading}>
              Register
            </BigButton>
          </form>
          {sendRegistration.isError && (
            <ErrorMessage errorMessage={formatError(sendRegistration.error)} />
          )}
          <SmallButton onClick={props.toggleLoginRegister}>Log In</SmallButton>
        </div>
      )}
    </>
  );
};

export default Register;
