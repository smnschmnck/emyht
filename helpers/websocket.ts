//ALL OF THIS CODE SHOULD BE RUN CLIENT SIDE ONLY!

import { QueryClient } from '@tanstack/react-query';
import { ContactRequest } from '../components/Chats';
import { WIDTH_BREAKPOINT } from '../helpers/clientGlobals';
import ISingleChat from '../interfaces/ISingleChat';

export const sendSocketAuthRequest = async (id: string) => {
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

interface WebSocketData {
  event: string;
  payload?: any;
}

const handleNewContactRequest = (
  queryClient: QueryClient,
  curContactRequestID: string,
  setCurContactRequestID: (id: string) => void
) => {
  queryClient.invalidateQueries(['contactRequests']).then(async () => {
    if (curContactRequestID === '') {
      const contactRequests = queryClient.getQueryData<ContactRequest[]>([
        'contactRequests',
      ]);
      if (contactRequests) {
        setCurContactRequestID(contactRequests[0]?.senderID);
      }
    }
  });
};

const handleNewChat = (
  queryClient: QueryClient,
  curChatID: string,
  setCurChatID: (id: string) => void
) => {
  queryClient.invalidateQueries(['chats']).then(async () => {
    if (curChatID === '') {
      const chats = queryClient.getQueryData<ISingleChat[]>(['chats']);
      if (chats) {
        setCurChatID(chats[0]?.chatID);
      }
    }
  });
};

export const handleWebsocketMessage = async (
  msg: MessageEvent<any>,
  queryClient: QueryClient,
  curChatID: string,
  chatOpened: boolean,
  curContactRequestID: string,
  setCurChatID: (id: string) => void,
  setCurContactRequestID: (id: string) => void
) => {
  const json: WebSocketData = JSON.parse(msg.data);
  const event = json.event;
  const payload = json.payload;
  switch (event) {
    case 'message':
      const messagePayload: { chatID: string } = payload;
      const chatID = messagePayload.chatID;
      const isSmallScreen = window.innerWidth <= WIDTH_BREAKPOINT;
      if (chatID === curChatID && (!isSmallScreen || chatOpened)) {
        queryClient.invalidateQueries(['messages', curChatID]);
      } else {
        queryClient.invalidateQueries(['chats']);
      }
      break;
    case 'chat':
      handleNewChat(queryClient, curChatID, setCurChatID);
      break;
    case 'contactRequest':
      handleNewContactRequest(
        queryClient,
        curContactRequestID,
        setCurContactRequestID
      );
      break;
    case 'auth':
      const authPayload: { id: string } = payload;
      sendSocketAuthRequest(authPayload.id);
      break;
    default:
      break;
  }
};
