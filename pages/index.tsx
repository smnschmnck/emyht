import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Head from 'next/head';
import { ContactRequest } from '../components/Chats';
import { getLoginData } from '../helpers/loginHelpers';
import styles from '../styles/IndexPage.module.css';
import fakeChats from '../dev/dummyData/fakeChats.json';
import MainChat from '../components/MainChat';
import fallBackProfilePicture from '../assets/images/fallback-pp.webp';
import { useState } from 'react';
import { ServerResponse } from 'http';
import { AddChatModal } from '../components/AddChatModal';
import ISingleChat from '../interfaces/ISingleChat';
import { ContactRequestModal } from '../components/ContactRequestModal';
import { BACKEND_HOST } from '../helpers/globals';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { Sidebar } from '../components/Sidebar';

interface IndexPageProps {
  email: string;
  username: string;
  isAdmin: boolean;
  chats: ISingleChat[];
  contactRequests: ContactRequest[];
}

const redirectOnUnverifiedEmail = (res: ServerResponse) => {
  res.writeHead(302, { Location: '/noEmail' });
  res.end();
};

const redirectOnLoggedOut = (res: ServerResponse) => {
  res.writeHead(302, { Location: '/login' });
  res.end();
};

const getContactRequests = async (cookies: NextApiRequestCookies) => {
  try {
    const res = await fetch(BACKEND_HOST + '/pendingContactRequests', {
      headers: {
        authorization: `Bearer ${cookies.SESSIONID}`,
      },
    });
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    return json;
  } catch (err) {
    return [];
  }
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
    getContactRequests(cookies);
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
        contactRequests: await getContactRequests(cookies),
      },
    };
  } catch {
    redirectOnLoggedOut(context.res);
    return emptyProps;
  }
};

const HomePage: NextPage<IndexPageProps> = ({
  username,
  email,
  chats,
  contactRequests,
}) => {
  const getFirstChatID = () => {
    if (!allChats[0]) {
      return '';
    }
    if (!allChats[0].chatID) {
      return '';
    }
    return allChats[0].chatID;
  };

  const [allChats, setAllChats] = useState(chats);
  const [curChatID, setCurChatID] = useState(getFirstChatID());
  const [chatOpened, setChatOpened] = useState(false);
  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [showContactRequestModal, setShowContactRequestModal] = useState(false);

  const openChat = (chatID: string) => {
    setCurChatID(chatID);
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
        <Sidebar
          chatOpened={chatOpened}
          allChats={allChats}
          contactRequests={contactRequests}
          openChat={openChat}
          username={username}
          email={email}
          setShowAddChatModal={setShowAddChatModal}
          setShowContactRequestModal={setShowContactRequestModal}
        />
        <div
          className={styles.chatContainer}
          id={chatOpened ? undefined : styles.closed}
        >
          {allChats.length > 0 &&
            allChats
              .filter((c) => c.chatID === curChatID)
              .slice(0, 1)
              .map((c) => (
                <MainChat
                  key={c.chatID}
                  chatID={curChatID}
                  profilePictureUrl={c.profilePictureUrl}
                  chatName={c.name}
                  closeChat={closeChat}
                />
              ))}
          {allChats.length <= 0 && <h1>oop no chat</h1>}
        </div>
      </div>
    </>
  );
};

export default HomePage;
