import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';

export type Chat = {
  chatID: string;
  creationTimestamp: string;
  chatName: string;
  chatType: 'group' | 'one_on_one' | 'contactRequest' | 'other';
  pictureUrl?: string;
  unreadMessages: number;
  messageType?: string;
  textContent?: string;
  timestamp?: string;
  deliveryStatus?: string;
  senderID?: string;
  senderUsername?: string;
};

export const getChats = async () => {
  const res = await fetch(`${env.VITE_BACKEND_HOST}/chats`, {
    credentials: 'include',
  });

  if (!res.ok) {
    return [];
  }
  const json = (await res.json()) as Chat[];

  return json;
};

type ChatInfo = {
  info: string;
};

export const getChatInfo = async (chatId: string) => {
  const res = await fetch(`${env.VITE_BACKEND_HOST}/chatInfo/${chatId}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new HttpError({
      message: await res.text(),
      statusCode: res.status,
    });
  }
  const json = (await res.json()) as ChatInfo;

  return json;
};
