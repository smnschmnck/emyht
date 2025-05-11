import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export type ChatMessage = {
  messageId: string;
  senderId: string;
  senderUsername: string;
  textContent: string;
  messageType: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
  mediaUrl: string;
  created_at: string;
  deliveryStatus: string;
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
