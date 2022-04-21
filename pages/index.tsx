import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Head from 'next/head';
import { useState } from 'react';
import Greeting from '../components/Greeting';
import Login from '../components/Login';
import Register from '../components/Register';
import { BACKEND_HOST } from '../helpers/globals';

interface HomeProps {
  loggedIn: boolean;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

interface GetUserResponse {
  sessionID: string;
  username: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async (
  context: GetServerSidePropsContext
) => {
  const noLogin: HomeProps = {
    loggedIn: false,
    username: '',
    firstName: '',
    lastName: '',
    isAdmin: false,
  };

  const sessionID = context.req.cookies.SESSIONID;

  if (!sessionID) {
    return {
      props: noLogin,
    };
  }

  const resp = await fetch(`${BACKEND_HOST}/user`, {
    headers: { authorization: `Bearer ${sessionID}` },
  });

  if (!resp.ok) {
    return {
      props: noLogin,
    };
  }

  const json: GetUserResponse = await resp.json();

  return {
    props: {
      loggedIn: true,
      username: json.username,
      firstName: json.firstName,
      lastName: json.lastName,
      isAdmin: json.isAdmin,
    },
  };
};

const Home: NextPage<HomeProps> = (props) => {
  const [showLogin, setShowLogin] = useState(!props.loggedIn);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedin, setIsLoggedIn] = useState(props.loggedIn);
  const [username, setUsername] = useState(props.username);
  const [firstName, setFirstname] = useState(props.firstName);
  const [lastName, setLastname] = useState(props.lastName);

  const toggleLoginRegister = () => {
    setShowLogin(!showLogin);
    setShowRegister(!showRegister);
  };

  const newLogin = (username: string, firstName: string, lastName: string) => {
    setUsername(username);
    setFirstname(firstName);
    setLastname(lastName);
    setIsLoggedIn(true);
    setShowLogin(false);
    setShowRegister(false);
  };

  return (
    <>
      <Head>
        <title>Hello</title>
      </Head>
      <div>
        {!isLoggedin && <h1>You are not logged in</h1>}
        {isLoggedin && (
          <Greeting
            username={username}
            firstName={firstName}
            lastName={lastName}
          />
        )}
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

export default Home;
