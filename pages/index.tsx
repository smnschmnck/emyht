import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Head from 'next/head';
import Greeting from '../components/Greeting';
import Logout from '../components/Logout';
import { getLoginData } from '../helpers/loginHelpers';

interface LoginProps {
  username: string;
  email: string;
  isAdmin: boolean;
}

export const getServerSideProps: GetServerSideProps<LoginProps | {}> = async (
  context: GetServerSidePropsContext
) => {
  const cookies = context.req.cookies;
  try {
    const getUserResponse = await getLoginData(cookies);
    return {
      props: {
        username: getUserResponse.username,
        email: getUserResponse.email,
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

const HomePage: NextPage<LoginProps> = (props) => {
  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <div>
        <h1>Home</h1>
        <Greeting username={props.username} email={props.email} />
        <Logout></Logout>
      </div>
    </>
  );
};

export default HomePage;
