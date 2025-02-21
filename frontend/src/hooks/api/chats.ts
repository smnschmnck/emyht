import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

export type Chat = {
  chatID: string;
  creationTimestamp: string;
  chatName: string;
  chatType: 'group' | 'one_on_one' | 'contactRequest' | 'other';
  pictureUrl?: string;
  unreadMessages: number;
  messageType?: 'plaintext' | 'image' | 'video' | 'audio' | 'data';
  textContent?: string;
  timestamp?: string;
  deliveryStatus?: string;
  senderID?: string;
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
