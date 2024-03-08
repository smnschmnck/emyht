import { getChatInfo, getChats } from '@/api/chats';
import {
  getContactRequests,
  getContacts,
  getSentContactRequests,
} from '@/api/contacts';
import { getMessagesByChat } from '@/api/messages';
import { getUserData } from '@/api/user';
import { createQueryKeyStore } from '@lukemorales/query-key-factory';

export const queryKeys = createQueryKeyStore({
  users: {
    details: {
      queryKey: ['userDetails'],
      queryFn: getUserData,
    },
  },
  chats: {
    all: {
      queryKey: ['allChats'],
      queryFn: getChats,
    },
    info: (chatId: string) => ({
      queryKey: [chatId],
      queryFn: () => getChatInfo(chatId),
    }),
  },
  contacts: {
    all: {
      queryKey: ['allContacts'],
      queryFn: getContacts,
    },
    sentRequests: {
      queryKey: ['sentRequests'],
      queryFn: getSentContactRequests,
    },
    incomingRequests: {
      queryKey: ['incomingRequests'],
      queryFn: getContactRequests,
    },
  },
  messages: {
    chat: (chatId: string) => ({
      queryKey: [chatId],
      queryFn: () => getMessagesByChat(chatId),
    }),
  },
});
