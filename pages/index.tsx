import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Head from 'next/head';
import Chats from '../components/Chats';
import { getLoginData } from '../helpers/loginHelpers';
import styles from '../styles/IndexPage.module.css';

interface UserProps {
  email: string;
  username: string;
  isAdmin: boolean;
}

export const getServerSideProps: GetServerSideProps<UserProps | {}> = async (
  context: GetServerSidePropsContext
) => {
  const cookies = context.req.cookies;
  try {
    const getUserResponse = await getLoginData(cookies);
    if (!getUserResponse.emailActive) {
      const res = context.res;
      res.writeHead(302, { Location: '/noEmail' });
      res.end();
      return {
        props: {},
      };
    }
    return {
      props: {
        email: getUserResponse.email,
        username: getUserResponse.username,
        isAdmin: getUserResponse.isAdmin,
      },
    };
  } catch {
    //Not logged in
    const res = context.res;
    res.writeHead(302, { Location: '/login' });
    res.end();
    return {
      props: {},
    };
  }
};

const HomePage: NextPage<UserProps> = (props) => {
  return (
    <>
      <Head>
        <title>emyht</title>
      </Head>
      <Chats></Chats>
    </>
  );
};

export default HomePage;
