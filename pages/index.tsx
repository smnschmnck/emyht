import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Head from 'next/head';
import { ContactRequest } from '../components/Chats';
import { getLoginData } from '../helpers/loginHelpers';
import styles from '../styles/IndexPage.module.css';
import MainChat from '../components/MainChat';
import { createContext, useState } from 'react';
import { ServerResponse } from 'http';
import { AddChatModal } from '../components/AddChatModal';
import ISingleChat from '../interfaces/ISingleChat';
import { ContactRequestModal } from '../components/ContactRequestModal';
import { BACKEND_HOST } from '../helpers/globals';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { Sidebar } from '../components/Sidebar';
import { ContactRequestDialog } from '../components/ContactRequestDialog';
import IUser from '../interfaces/IUser';

interface IndexPageProps {
  user: IUser;
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

const getChats = async (cookies: NextApiRequestCookies) => {
  try {
    const res = await fetch(BACKEND_HOST + '/chats', {
      headers: {
        authorization: `Bearer ${cookies.SESSIONID}`,
      },
    });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as ISingleChat[];
    return json;
  } catch (err) {
    return [];
  }
};

const emptyProps = {
  props: {},
};

export const UserCtx = createContext<IUser | null>(null);

export const getServerSideProps: GetServerSideProps<
  IndexPageProps | {}
> = async (context: GetServerSidePropsContext) => {
  const cookies = context.req.cookies;
  try {
    getContactRequests(cookies);
    const getUserResponse = await getLoginData(cookies);
    const user: IUser = {
      uuid: getUserResponse.uuid,
      username: getUserResponse.username,
      email: getUserResponse.email,
    };
    if (!getUserResponse.emailActive) {
      redirectOnUnverifiedEmail(context.res);
      return emptyProps;
    }
    return {
      props: {
        user: user,
        chats: await getChats(cookies),
        contactRequests: await getContactRequests(cookies),
      },
    };
  } catch {
    redirectOnLoggedOut(context.res);
    return emptyProps;
  }
};

const HomePage: NextPage<IndexPageProps> = ({
  user,
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

  const getFirstContactRequestID = () => {
    if (!allContactRequests[0]) {
      return '';
    }
    if (!allContactRequests[0].senderID) {
      return '';
    }
    return allContactRequests[0].senderID;
  };

  const [allChats, setAllChats] = useState(chats);
  const [allContactRequests, setAllContactRequests] = useState(contactRequests);
  const [curChatID, setCurChatID] = useState(getFirstChatID());
  const [curContactRequestID, setCurContactRequestID] = useState(
    getFirstContactRequestID()
  );
  const [chatOpened, setChatOpened] = useState(false);
  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [showContactRequestModal, setShowContactRequestModal] = useState(false);
  const [openedContactRequest, setOpenedContactRequest] = useState(false);

  const openChat = (chatID: string) => {
    setCurChatID(chatID);
    setChatOpened(true);
    setOpenedContactRequest(false);
  };

  const openContactRequest = (contactRequestID: string) => {
    setCurContactRequestID(contactRequestID);
    setChatOpened(true);
    setOpenedContactRequest(true);
  };

  const closeChat = () => {
    setChatOpened(false);
    setOpenedContactRequest(false);
  };

  const refreshContactRequests = async () => {
    const res = await fetch('/api/getPendingContactRequests');
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    const json = await res.json();
    setAllContactRequests(json);
  };

  const refreshChats = async () => {
    const res = await fetch('/api/getChats');
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    const json = await res.json();
    setAllChats(json);
  };

  return (
    <UserCtx.Provider value={user}>
      <Head>
        <title>emyht</title>
      </Head>
      {showAddChatModal && (
        <AddChatModal
          refreshChats={refreshChats}
          closeHandler={() => setShowAddChatModal(false)}
        />
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
          contactRequests={allContactRequests}
          openChat={openChat}
          openContactRequest={openContactRequest}
          setShowAddChatModal={setShowAddChatModal}
          setShowContactRequestModal={setShowContactRequestModal}
        />
        <div
          className={styles.chatContainer}
          id={chatOpened ? undefined : styles.closed}
        >
          {!openedContactRequest &&
            allChats.length > 0 &&
            allChats
              .filter((c) => c.chatID === curChatID)
              .slice(0, 1)
              .map((c) => (
                <MainChat
                  key={c.chatID}
                  chatID={curChatID}
                  profilePictureUrl={c.pictureUrl}
                  chatName={c.chatName}
                  closeChat={closeChat}
                />
              ))}
          {allChats.length <= 0 && !chatOpened && <h1>oop no chat</h1>}
          {openedContactRequest &&
            allContactRequests
              .filter((r) => r.senderID === curContactRequestID)
              .map((r) => (
                <ContactRequestDialog
                  refreshContactRequests={refreshContactRequests}
                  key={r.senderID}
                  closeChat={closeChat}
                  senderID={r.senderID}
                  senderUsername={r.senderUsername}
                  senderProfilePicture={r.senderProfilePicture}
                />
              ))}
        </div>
      </div>
    </UserCtx.Provider>
  );
};

export default HomePage;
