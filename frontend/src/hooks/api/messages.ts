import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';

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

export const useChatMessages = (chatId?: string) => {
  return useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: async () => {
      if (!chatId) {
        return [];
      }

      const res = await fetch(
        `${env.VITE_BACKEND_HOST}/chatMessages/${chatId}`,
        {
          credentials: 'include',
        }
      );

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as ChatMessage[];
    },
  });
};
