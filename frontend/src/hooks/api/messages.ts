import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export type ChatMessage = {
  id: string;
  senderId: string;
  senderUsername: string;
  textContent: string;
  messageType: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
  mediaUrl: string;
  createdAt: string;
  deliveryStatus: string;
  blocked: boolean;
};

export const useChatMessages = (chatId?: string) => {
  return useQuery({
    queryKey: ['chatMessages', chatId],
    queryFn: async () => {
      if (!chatId) {
        return [];
      }

      const res = await fetchWithDefaults(`/chatMessages/${chatId}`);

      if (!res.ok) {
        throw new Error(await res.text());
      }

      return (await res.json()) as ChatMessage[];
    },
  });
};
