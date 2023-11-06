import { getChats } from '@/api/chatsApi';
import { getUserData } from '@/api/userApi';
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
});
