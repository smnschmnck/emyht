//ALL OF THIS CODE SHOULD BE RUN CLIENT SIDE ONLY!

import { QueryClient } from '@tanstack/react-query';
import { WIDTH_BREAKPOINT } from '../helpers/clientGlobals';

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

export const handleWebsocketMessage = (
  msg: MessageEvent<any>,
  queryClient: QueryClient,
  curChatID: string,
  chatOpened: boolean
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
      queryClient.invalidateQueries(['chats']);
      break;
    case 'contactRequest':
      queryClient.invalidateQueries(['contactRequests']);
      break;
    case 'auth':
      const authPayload: { id: string } = payload;
      sendSocketAuthRequest(authPayload.id);
      break;
    default:
      break;
  }
};
