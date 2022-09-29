import { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import styles from '../styles/IndexPage.module.css';
import { AddChatModal } from './AddChatModal';
import { ContactRequestModal } from './ContactRequestModal';
import { Sidebar } from './Sidebar';
import MainChat from './MainChat';
import ISingleChat from '../interfaces/ISingleChat';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ContactRequest } from './Chats';
import { handleWebsocketMessage } from '../helpers/websocket';
import { NextRouter, useRouter } from 'next/router';

const shallowPush = (router: NextRouter, route: string) => {
  router.push(route, undefined, {
    shallow: true,
  });
};

export const ChatSPA: React.FC = () => {
  //Query server side data
  const queryClient = useQueryClient();
  const chatsQuery = useQuery<ISingleChat[]>(['chats']);
  const chats = chatsQuery.data ?? [];
  const contactRequestsQuery = useQuery<ContactRequest[]>(['contactRequests']);
  const contactRequests = contactRequestsQuery.data ?? [];

  //State
  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [showContactRequestModal, setShowContactRequestModal] = useState(false);
  const [curChatID, setCurChatID] = useState(chats[0]?.chatID ?? '');
  const [curContactRequestID, setCurContactRequestID] = useState(
    contactRequests[0]?.senderID ?? ''
  );
  const [contactRequestOpened, setContactRequestOpened] = useState(false);
  const [chatOpened, setChatOpened] = useState(false);
  const webSocket = useRef<WebSocket | null>(null);

  const router = useRouter();

  //Handling Websocket connection
  useEffect(() => {
    const socketInit = () => {
      //When encountering connection bugs please check for correct HOST in .env first!!!
      const WEBSOCKET_HOST = process.env.NEXT_PUBLIC_WEBSOCKET_HOST ?? '';
      webSocket.current = new WebSocket(WEBSOCKET_HOST);
    };
    socketInit();
  }, []);

  useEffect(() => {
    if (!webSocket.current) return;
    webSocket.current.onmessage = (msg) => {
      handleWebsocketMessage(
        msg,
        queryClient,
        curChatID,
        chatOpened,
        curContactRequestID,
        setCurChatID,
        setCurContactRequestID
      );
    };
  }, [
    chatOpened,
    chatsQuery,
    contactRequestsQuery,
    curChatID,
    curContactRequestID,
    queryClient,
  ]);

  const switchToContactReqModal = () => {
    setShowAddChatModal(false);
    setShowContactRequestModal(true);
  };

  const openChat = (chatID: string) => {
    shallowPush(router, `/?chatID=${chatID}`);
    chatsQuery.refetch();
    closeContactRequest();
    setChatOpened(true);
    setCurChatID(chatID);
  };

  const closeChat = () => {
    setChatOpened(false);
    contactRequestsQuery.refetch();
    if (contactRequests.length > 0) {
      setContactRequestOpened(true);
    }
  };

  const openContactRequest = (contactRequestID: string) => {
    shallowPush(router, `/?contactRequestID=${contactRequestID}`);
    contactRequestsQuery.refetch();
    closeChat();
    setContactRequestOpened(true);
    setCurContactRequestID(contactRequestID);
  };

  const closeContactRequest = () => {
    setContactRequestOpened(false);
    contactRequestsQuery.refetch();
    if (chats.length > 0) {
      setChatOpened(true);
    }
  };

  useEffect(() => {
    if (!router.query.chatID) return;
    const routeChatID = router.query.chatID.toString();
    setContactRequestOpened(false);
    setChatOpened(true);
    setCurChatID(routeChatID);
  }, [router.query.chatID]);

  useEffect(() => {
    if (!router.query.contactRequestID) return;
    const routeContactRequestID = router.query.contactRequestID.toString();
    setContactRequestOpened(false);
    setChatOpened(true);
    setCurContactRequestID(routeContactRequestID);
  }, [router.query.contactRequestID]);

  return (
    <>
      <Head>
        <title>emyht</title>
      </Head>
      {showAddChatModal && (
        <AddChatModal
          showContactReqModal={switchToContactReqModal}
          closeHandler={() => setShowAddChatModal(false)}
          setCurChatID={setCurChatID}
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
          openChat={openChat}
          openContactRequest={openContactRequest}
          setShowAddChatModal={setShowAddChatModal}
          setShowContactRequestModal={setShowContactRequestModal}
        />
        <div
          className={styles.chatContainer}
          id={chatOpened ? undefined : styles.closed}
        >
          <MainChat
            chats={chats}
            contactRequests={contactRequests}
            chatOpened={chatOpened}
            contactRequestID={curContactRequestID}
            contactRequestOpened={contactRequestOpened}
            key={curChatID}
            chatID={curChatID}
            closeChat={closeChat}
            setShowAddChatModal={setShowAddChatModal}
            closeContactRequest={closeContactRequest}
          />
        </div>
      </div>
    </>
  );
};
