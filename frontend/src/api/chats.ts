import { env } from '@/env';

type Chat = {
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
