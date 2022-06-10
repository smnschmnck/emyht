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
import { useState } from 'react';

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
  const curChat = fakeChats[0];
  const [curChatID, setCurChatID] = useState(curChat.chatID);
  const [curProfilePictureUrl, setCurProfilePictureUrl] = useState(
    curChat.profilePictureUrl
  );
  const [curChatName, setCurChatName] = useState(curChat.name);
  const [chatOpened, setChatOpened] = useState(false);

  const openChat = (
    chatID: string,
    profilePictureUrl: string,
    chatName: string
  ) => {
    setCurChatID(chatID);
    setCurProfilePictureUrl(profilePictureUrl);
    setCurChatName(chatName);
    setChatOpened(true);
  };

  const closeChat = () => {
    setChatOpened(false);
  };

  return (
    <>
      <Head>
        <title>emyht</title>
      </Head>
      <div className={styles.main}>
        <div
          className={styles.sidebar}
          id={chatOpened ? styles.closed : undefined}
        >
          <div className={styles.innerSidebar}>
            <div className={styles.logoContainer}>
              <Image src={logo} alt="emyht-logo" />
            </div>
            <Chats chats={fakeChats} openChat={openChat} />
          </div>
          <UserInfoAndSettings username={props.username} email={props.email} />
        </div>
        <div
          className={styles.chatContainer}
          id={chatOpened ? undefined : styles.closed}
        >
          <MainChat
            chatID={curChatID}
            profilePictureUrl={curProfilePictureUrl}
            chatName={curChatName}
            closeChat={closeChat}
          />
        </div>
      </div>
    </>
  );
};

export default HomePage;
