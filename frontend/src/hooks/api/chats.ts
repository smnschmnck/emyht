import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';

type LastChatMessage = {
  senderId: string;
  senderUsername: string;
  messageType: string;
  textContent?: string;
  createdAt: string;
  deliveryStatus: string;
  isBlocked: false;
};

export type Chat = {
  id: string;
  chatName: string;
  chatType: 'one_on_one' | 'group';
  createdAt: string;
  chatPictureUrl: string;
  unreadMessages: 0;
  lastMessage: LastChatMessage | null;
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

export const useCurrentChat = (chatId: string) => {
  const { data: allChats } = useChats();

  if (!allChats) {
    return;
  }

  return allChats?.find((c) => c.id === chatId);
};
