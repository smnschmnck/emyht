import { env } from '@/env';

export type ChatMessage = {
  messageID: string;
  senderID: string;
  senderUsername: string;
  textContent: string;
  messageType: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
  mediaUrl: string;
  timestamp: number;
  deliveryStatus: string;
};

export const getMessagesByChat = async (chatId: string) => {
  const res = await fetch(`${env.VITE_BACKEND_HOST}/chatMessages/${chatId}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }

  return (await res.json()) as ChatMessage[];
};
