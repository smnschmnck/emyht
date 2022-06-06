import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Head from 'next/head';
import Chats from '../components/Chats';
import { getLoginData } from '../helpers/loginHelpers';
import styles from '../styles/IndexPage.module.css';
import fakeChats from '../dev/dummyData/fakeChats.json';
import Image from 'next/image';
import logo from '../assets/images/logo-small.webp';
import UserInfoAndSettings from '../components/UserInfoAndSettings';
import MainChat from '../components/MainChat';

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

//dummy
const pbUrl =
  'https://loremflickr.com/cache/resized/65535_52052815502_26e487ffd0_z_640_480_nofilter.jpg';

const HomePage: NextPage<UserProps> = (props) => {
  return (
    <>
      <Head>
        <title>emyht</title>
      </Head>
      <div className={styles.main}>
        <div className={styles.sidebar}>
          <div className={styles.innerSidebar}>
            <div className={styles.logoContainer}>
              <Image src={logo} alt="emyht-logo" />
            </div>
            <Chats chats={fakeChats} />
          </div>
          <UserInfoAndSettings username={props.username} email={props.email} />
        </div>
        <MainChat
          chatName={'Shari Waelchi'}
          lastOnline={'13:21'}
          profilePictureUrl={pbUrl}
        />
      </div>
    </>
  );
};

export default HomePage;
