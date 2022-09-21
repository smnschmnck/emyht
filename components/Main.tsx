import { createContext, useEffect, useState } from 'react';
import { WIDTH_BREAKPOINT } from '../helpers/clientGlobals';
import ISingleChat from '../interfaces/ISingleChat';
import { ContactRequest } from './Chats';
import Head from 'next/head';
import styles from '../styles/IndexPage.module.css';
import MainChat, { ISingleMessage } from '../components/MainChat';
import { AddChatModal } from '../components/AddChatModal';
import { ContactRequestModal } from '../components/ContactRequestModal';
import { Sidebar } from '../components/Sidebar';
import { ContactRequestDialog } from '../components/ContactRequestDialog';
import { NoChatsInfo } from '../components/NoChatsInfo';
import IUser from '../interfaces/IUser';

export const UserCtx = createContext<IUser | null>(null);

interface WebSocketData {
  event: string;
  payload: any;
}

interface IMessagePayload {
  chatID: string;
  messages: ISingleMessage[];
}

interface MainProps {
  user: IUser;
  chats: ISingleChat[];
  firstChatID?: string;
  contactRequests: ContactRequest[];
}

export const Main: React.FC<MainProps> = ({
  user,
  chats,
  firstChatID,
  contactRequests,
}) => {
  const [allChats, setAllChats] = useState(chats);
  const [messages, setMessages] = useState<ISingleMessage[]>([]);
  const [allContactRequests, setAllContactRequests] = useState(contactRequests);
  const [curChatID, setCurChatID] = useState(firstChatID ?? '');
  const [curContactRequestID, setCurContactRequestID] = useState(
    allContactRequests[0]?.senderID ?? ''
  );
  const [handledContactReqs, setHandledContactReqs] = useState<string[]>([]);
  const [chatOpened, setChatOpened] = useState(false);
  const [showAddChatModal, setShowAddChatModal] = useState(false);
  const [showContactRequestModal, setShowContactRequestModal] = useState(false);
  const [openedContactRequest, setOpenedContactRequest] = useState(
    Boolean(!firstChatID && curContactRequestID)
  );
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
    if (handledContactReqs.length > 0 && !openedContactRequest) {
      refreshContactRequests();
    }
  }, [handledContactReqs.length, openedContactRequest]);

  useEffect(() => {
    const confirmCurChatAsRead = async (newChats?: ISingleChat[]) => {
      const chats = newChats ?? allChats;
      const curChat = chats.find((c) => c.chatID === curChatID);
      const curUnreadMessages = curChat?.unreadMessages ?? 0;
      const chatIsOpened = chatOpened && !openedContactRequest;
      const isSmallScreen = window.innerWidth <= WIDTH_BREAKPOINT;

      if (curUnreadMessages <= 0 || (!chatIsOpened && isSmallScreen)) {
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

    confirmCurChatAsRead();

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
        case 'contactRequest':
          const contactRequestPayload: ContactRequest[] = payload;
          setAllContactRequests(contactRequestPayload);
          break;
        default:
          break;
      }
    };

    window.onresize = () => {
      if (allChats.length <= 0) return;
      if (window.innerWidth > WIDTH_BREAKPOINT) {
        if (!chatOpened) {
          setChatOpened(true);
        }
      } else {
        if (!chatOpened) {
          setChatOpened(false);
        }
      }
    };
  }, [webSocket, curChatID, allChats, chatOpened, openedContactRequest]);

  const fetchMessages = async (chatID: string) => {
    if (!chatID) return;
    setMessages([]);
    const res = await fetch(`/api/getChatMessages/${chatID}`);
    if (!res.ok) {
      alert(await res.text());
      return;
    }
    const json = (await res.json()) as ISingleMessage[];
    setMessages(json);
  };

  useEffect(() => {
    const isSmallScreen = window.innerWidth <= WIDTH_BREAKPOINT;
    if (isSmallScreen && !chatOpened) {
      return;
    }
    fetchMessages(curChatID);
  }, [chatOpened, curChatID]);

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
    setChatOpened(true);
    setOpenedContactRequest(false);
    setCurChatID(chatID);
    setChatAsRead(chatID);
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
    setHandledContactReqs([]);
  };

  const switchToContactReqModal = () => {
    setShowAddChatModal(false);
    setShowContactRequestModal(true);
  };

  const getCurChat = () => {
    return allChats.find((c) => c.chatID === curChatID);
  };

  const getCurContactRequest = () => {
    return allContactRequests.find((r) => r.senderID === curContactRequestID);
  };

  return (
    <UserCtx.Provider value={user}>
      <Head>
        <title>emyht</title>
      </Head>
      {showAddChatModal && (
        <AddChatModal
          showContactReqModal={switchToContactReqModal}
          setChats={setAllChats}
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
          handledContactReqs={handledContactReqs}
        />
        <div
          className={styles.chatContainer}
          id={chatOpened ? undefined : styles.closed}
        >
          {!openedContactRequest && getCurChat() && (
            <MainChat
              key={getCurChat()?.chatID}
              chatID={curChatID}
              profilePictureUrl={getCurChat()?.pictureUrl}
              chatName={getCurChat()?.chatName ?? ''}
              messages={messages}
              setMessages={setMessages}
              closeChat={closeChat}
              fetchMessages={fetchMessages}
            />
          )}
          {allChats.length <= 0 && allContactRequests.length <= 0 && (
            <NoChatsInfo setShowAddChatModal={setShowAddChatModal} />
          )}
          {openedContactRequest && getCurContactRequest() && (
            <ContactRequestDialog
              refreshContactRequests={refreshContactRequests}
              key={getCurContactRequest()?.senderID}
              closeChat={closeChat}
              senderID={getCurContactRequest()?.senderID ?? ''}
              senderUsername={getCurContactRequest()?.senderUsername ?? ''}
              senderProfilePicture={
                getCurContactRequest()?.senderProfilePicture
              }
              handledContactReqs={handledContactReqs}
              setHandledContactReqs={setHandledContactReqs}
            />
          )}
        </div>
      </div>
    </UserCtx.Provider>
  );
};
