import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Router from 'next/router';
import Head from 'next/head';
import { useState } from 'react';
import Login from '../components/Login';
import Register from '../components/Register';
import { getLoginData } from '../helpers/loginHelpers';

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
        <title>Hello</title>
      </Head>
      <div>
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
    </>
  );
};

export default LoginPage;
