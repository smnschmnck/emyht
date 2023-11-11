import { getChats } from '@/api/chats';
import { getContacts, getSentContactRequests } from '@/api/contacts';
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
  },
});
