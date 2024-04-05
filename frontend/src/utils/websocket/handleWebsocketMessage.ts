import { queryKeys } from '@/configs/queryKeys';
import { env } from '@/env';
import { QueryClient } from '@tanstack/react-query';

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

export const handleWebsocketMessage = async (
  msg: MessageEvent<string>,
  queryClient: QueryClient,
  setIsAuthenticated: ((isAuthenticated: boolean) => void) | null,
  chatId?: string
) => {
  const json: WebSocketData = JSON.parse(msg.data);
  const event = json.event;
  const payload = json.payload;

  if (event === 'message') {
    queryClient.refetchQueries(queryKeys.chats.all);
    if (chatId) {
      queryClient.refetchQueries(queryKeys.messages.chat(chatId));
    }
  }
  if (event === 'chat') {
    queryClient.refetchQueries(queryKeys.chats.all);
  }
  if (event === 'contactRequest') {
    queryClient.refetchQueries(queryKeys.contacts.incomingRequests);
  }
  if (event === 'auth') {
    if (!payload?.id) {
      return;
    }
    const { success } = await sendSocketAuthRequest(payload.id);
    setIsAuthenticated?.(success);
  }
};
