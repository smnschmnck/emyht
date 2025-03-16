import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export type Chat = {
  chatId: string;
  chatType: 'group' | 'one_on_one' | 'contactRequest' | 'other';
  creationTimestamp: number;
  chatName: string;
  chatPictureUrl?: string;
  unreadMessages: number;
  messageType?: {
    messageType: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
    valid: boolean;
  };
  textContent?: string | null;
  timestamp?: number;
  deliveryStatus?: {
    deliveryStatus: 'sent' | 'received' | 'read' | 'pending' | 'failed';
    valid: boolean;
  };
  senderId?: string;
  senderUsername?: string;
};

export const useChats = () => {
  return useQuery({
    queryKey: ['allChats'],
    queryFn: async () => {
      const res = await fetchWithDefaults('/chats');

      if (!res.ok) {
        return [];
      }
      const json = (await res.json()) as Chat[];

      return json;
    },
  });
};
