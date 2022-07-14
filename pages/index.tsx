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
import logo from '../assets/images/emyht-logo.svg';
import UserInfoAndSettings from '../components/UserInfoAndSettings';
import MainChat from '../components/MainChat';
import fallBackProfilePicture from '../assets/images/fallback-pp.webp';
import { useState } from 'react';
import { ServerResponse } from 'http';
import { AddChatModal } from '../components/AddChatModal';
import ISingleChat from '../interfaces/ISingleChat';
import { ContactRequestModal } from '../components/ContactRequestModal';

interface IndexPageProps {
  email: string;
  username: string;
  isAdmin: boolean;
  chats: ISingleChat[];
}

const redirectOnUnverifiedEmail = (res: ServerResponse) => {
  res.writeHead(302, { Location: '/noEmail' });
  res.end();
};

const redirectOnLoggedOut = (res: ServerResponse) => {
  res.writeHead(302, { Location: '/login' });
  res.end();
};

const getChats = () => {
  //TODO Get actual chats
  return fakeChats.map((c) => {
    return {
      chatID: c.chatID,
      name: c.name,
      time: c.time,
      lastMessage: c.lastMessage,
      read: c.read,
      unreadMessagesCount: c.unreadMessagesCount,
      ownMessage: c.ownMessage,
      deliveryStatus: c.deliveryStatus,
      profilePictureUrl: c.profilePictureUrl ?? fallBackProfilePicture.src,
    };
  });
};

const emptyProps = {
  props: {},
};

export const getServerSideProps: GetServerSideProps<
  IndexPageProps | {}
> = async (context: GetServerSidePropsContext) => {
  const cookies = context.req.cookies;
  try {
    const getUserResponse = await getLoginData(cookies);
    if (!getUserResponse.emailActive) {
      redirectOnUnverifiedEmail(context.res);
      return emptyProps;
    }
    return {
      props: {
        email: getUserResponse.email,
        username: getUserResponse.username,
        isAdmin: getUserResponse.isAdmin,
        chats: getChats(),
      },
    };
  } catch {
    redirectOnLoggedOut(context.res);
    return emptyProps;
  }
};

const HomePage: NextPage<IndexPageProps> = ({ username, email, chats }) => {
  const curChat = chats[0];
  const [curChatID, setCurChatID] = useState(curChat.chatID);
  const [curProfilePictureUrl, setCurProfilePictureUrl] = useState(
    curChat.profilePictureUrl
  );
  const [curChatName, setCurChatName] = useState(curChat.name);
  const [chatOpened, setChatOpened] = useState(false);
  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [showContactRequestModal, setShowContactRequestModal] = useState(false);

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
      {showAddChatModal && (
        <AddChatModal closeHandler={() => setShowAddChatModal(false)} />
      )}
      {showContactRequestModal && (
        <ContactRequestModal
          closeHandler={() => setShowContactRequestModal(false)}
        />
      )}
      <div className={styles.main}>
        <div
          className={styles.sidebar}
          id={chatOpened ? styles.closed : undefined}
        >
          <div className={styles.innerSidebar}>
            <div className={styles.logoContainer}>
              <Image src={logo} alt="emyht-logo" />
            </div>
            <Chats
              chats={chats}
              openChat={openChat}
              addChatButtonClickHandler={() => setShowAddChatModal(true)}
              sendFriendRequestButtonClickHandler={() =>
                setShowContactRequestModal(true)
              }
            />
          </div>
          <UserInfoAndSettings username={username} email={email} />
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
