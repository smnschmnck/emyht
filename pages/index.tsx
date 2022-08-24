import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import Head from 'next/head';
import { ContactRequest } from '../components/Chats';
import { getLoginData } from '../helpers/loginHelpers';
import styles from '../styles/IndexPage.module.css';
import MainChat, { ISingleMessage } from '../components/MainChat';
import { createContext, useEffect, useState } from 'react';
import { ServerResponse } from 'http';
import { AddChatModal } from '../components/AddChatModal';
import ISingleChat from '../interfaces/ISingleChat';
import { ContactRequestModal } from '../components/ContactRequestModal';
import { BACKEND_HOST } from '../helpers/globals';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import { Sidebar } from '../components/Sidebar';
import { ContactRequestDialog } from '../components/ContactRequestDialog';
import IUser from '../interfaces/IUser';

export const UserCtx = createContext<IUser | null>(null);

interface IndexPageProps {
  user: IUser;
  isAdmin: boolean;
  chats: ISingleChat[];
  firstChatID: string;
  contactRequests: ContactRequest[];
  firstChatMessages: ISingleMessage[];
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

const getChatMessages = async (
  chatID: string,
  cookies: NextApiRequestCookies
) => {
  try {
    const res = await fetch(`${BACKEND_HOST}/chatMessages/${chatID}`, {
      headers: {
        authorization: `Bearer ${cookies.SESSIONID}`,
      },
    });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as ISingleMessage[];
    return json;
  } catch (err) {
    return [];
  }
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
    const user: IUser = {
      uuid: getUserResponse.uuid,
      username: getUserResponse.username,
      email: getUserResponse.email,
    };
    if (!getUserResponse.emailActive) {
      redirectOnUnverifiedEmail(context.res);
      return emptyProps;
    }
    const chats = await getChats(cookies);
    const firstChatID = chats[0]?.chatID ?? '';
    const firstChatMessages: ISingleMessage[] = firstChatID
      ? await getChatMessages(firstChatID, cookies)
      : [];
    return {
      props: {
        user: user,
        chats: chats,
        firstChatID: firstChatID,
        contactRequests: await getContactRequests(cookies),
        firstChatMessages: firstChatMessages,
      },
    };
  } catch {
    redirectOnLoggedOut(context.res);
    return emptyProps;
  }
};

interface WebSocketData {
  event: string;
  payload: any;
}

interface IMessagePayload {
  chatID: string;
  messages: ISingleMessage[];
}

const HomePage: NextPage<IndexPageProps> = ({
  user,
  chats,
  firstChatID,
  contactRequests,
  firstChatMessages,
}) => {
  const [allChats, setAllChats] = useState(chats);
  const [messages, setMessages] = useState<ISingleMessage[]>(firstChatMessages);
  const [allContactRequests, setAllContactRequests] = useState(contactRequests);
  const [curChatID, setCurChatID] = useState(firstChatID);
  const [curContactRequestID, setCurContactRequestID] = useState(
    allContactRequests[0]?.senderID ?? ''
  );
  const [chatOpened, setChatOpened] = useState(false);
  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [showContactRequestModal, setShowContactRequestModal] = useState(false);
  const [openedContactRequest, setOpenedContactRequest] = useState(false);
  const [webSocket, setWs] = useState<WebSocket | null>(null);

  const sendSocketAuthRequest = async (id: string) => {
    const body = {
      id: id,
    };
    const res = await fetch('/api/authenticateSocketConnection', {
      method: 'post',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    return;
  };

  useEffect(() => {
    const socketInit = () => {
      //When encountering connection bugs please check for correct HOST in .env first!!!
      const WEBSOCKET_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST ?? '';
      const socket = new WebSocket(WEBSOCKET_HOST);
      setWs(socket);
    };
    socketInit();
  }, []);

  useEffect(() => {
    if (!webSocket) return;
    webSocket.onmessage = (msg) => {
      const json: WebSocketData = JSON.parse(msg.data);
      const event = json.event;
      const payload = json.payload;
      switch (event) {
        case 'message':
          const messagePayload: IMessagePayload = payload;
          if (messagePayload.chatID !== curChatID) return;
          setMessages(messagePayload.messages);
          break;
        case 'auth':
          const authPayload: { id: string } = payload;
          sendSocketAuthRequest(authPayload.id);
          break;
        case 'chat':
          const chatPayload: ISingleChat[] = payload;
          confirmCurChatAsRead(chatPayload);
          break;
        default:
          break;
      }
    };
  }, [webSocket, curChatID]);

  const fetchMessages = async (chatID: string) => {
    const res = await fetch(`/api/getChatMessages/${chatID}`);
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    const json = (await res.json()) as ISingleMessage[];
    setMessages(json);
  };

  const confirmCurChatAsRead = async (chats: ISingleChat[]) => {
    const curChat = chats.find((c) => c.chatID === curChatID);
    const curUnreadMessages = curChat?.unreadMessages ?? 0;
    if (!(curUnreadMessages > 0)) {
      setAllChats(chats);
      return;
    }
    const body = {
      chatID: curChatID,
    };
    const res = await fetch('/api/confirmReadChat', {
      method: 'post',
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    const json: ISingleChat[] = await res.json();
    setAllChats(json);
  };

  const setChatAsRead = (chatID: string) => {
    const tmpChats = allChats.map((c) => {
      if (c.chatID === chatID) {
        c.unreadMessages = 0;
      }
      return c;
    });
    setAllChats(tmpChats);
  };

  const openChat = (chatID: string) => {
    setCurChatID(chatID);
    fetchMessages(chatID);
    setChatAsRead(chatID);
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
                  messages={messages}
                  setMessages={setMessages}
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
