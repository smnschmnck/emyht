import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Greeting from '../components/Greeting';
import { getLoginData } from '../helpers/loginHelpers';

interface LoginProps {
  username: string;
  firstName: string;
  lastName: string;
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
        firstName: getUserResponse.firstName,
        lastName: getUserResponse.lastName,
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
      <h1>Home</h1>
      <Greeting
        username={props.username}
        firstName={props.firstName}
        lastName={props.lastName}
      />
    </>
  );
};

export default HomePage;
