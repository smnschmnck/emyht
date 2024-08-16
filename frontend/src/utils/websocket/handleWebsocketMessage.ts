import { env } from '@/env';

const sendSocketAuthRequest = async (id: string) => {
  const body = {
    id: id,
  };
  const res = await fetch(
    `${env.VITE_BACKEND_HOST}/authenticateSocketConnection`,
    {
      method: 'post',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    }
  );
  if (!res.ok) {
    return { success: false };
  }

  return { success: true };
};

type EventTypes = 'message' | 'chat' | 'contactRequest' | 'auth';

type WebSocketData = {
  event: EventTypes;
  payload?: { id: string };
};

type HandleWebsocketMessageArgs = {
  msg: MessageEvent<string>;
  refetchChats: () => void;
  refetchChatMessages: () => void;
  refetchContactRequests: () => void;
  setIsAuthenticated: ((isAuthenticated: boolean) => void) | null;
  chatId?: string;
};

export const handleWebsocketMessage = async ({
  msg,
  refetchChats,
  setIsAuthenticated,
  chatId,
  refetchChatMessages,
  refetchContactRequests,
}: HandleWebsocketMessageArgs) => {
  const json: WebSocketData = JSON.parse(msg.data);
  const event = json.event;
  const payload = json.payload;

  if (event === 'message') {
    refetchChats();
    if (chatId) {
      refetchChatMessages();
    }
  }
  if (event === 'chat') {
    refetchChats();
  }
  if (event === 'contactRequest') {
    refetchContactRequests();
  }
  if (event === 'auth') {
    if (!payload?.id) {
      return;
    }
    const { success } = await sendSocketAuthRequest(payload.id);
    setIsAuthenticated?.(success);
  }
};
