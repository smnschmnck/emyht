import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import logo from '../assets/images/logo-small.webp';
import Image from 'next/image';
import Router from 'next/router';
import Head from 'next/head';
import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import { getLoginData } from '../helpers/loginHelpers';
import styles from '../styles/LoginPage.module.css';

export const getServerSideProps: GetServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const cookies = context.req.cookies;
  try {
    await getLoginData(cookies);
    const res = context.res;
    res.writeHead(302, { Location: '/' });
    res.end();
    return {
      props: {},
    };
  } catch {
    return {
      props: {},
    };
  }
};

const LoginPage: NextPage = () => {
  const [showLogin, setShowLogin] = useState(true);
  const [showRegister, setShowRegister] = useState(false);

  const toggleLoginRegister = () => {
    setShowLogin(!showLogin);
    setShowRegister(!showRegister);
  };

  const newLogin = () => {
    Router.push('/');
  };

  return (
    <>
      <Head>
        <title>Login</title>
        {showRegister && <title>Register</title>}
        {showLogin && <title>Login</title>}
      </Head>
      <header className={styles.mainHeader}>
        <div className={styles.logoContainer}>
          <Image src={logo} alt='emyht-logo'></Image>
        </div>
      </header>
      <div className={styles.main}>
        <div className={styles.content}>
          {showLogin && (
            <Login
              showLogin={showLogin}
              setShowLogin={setShowLogin}
              showRegister={showRegister}
              setShowRegister={setShowRegister}
              toggleLoginRegister={toggleLoginRegister}
              newLogin={newLogin}
            />
          )}
          {showRegister && (
            <Register
              showLogin={showLogin}
              setShowLogin={setShowLogin}
              showRegister={showRegister}
              setShowRegister={setShowRegister}
              toggleLoginRegister={toggleLoginRegister}
              newLogin={newLogin}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default LoginPage;
