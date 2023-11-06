import { FC } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/configs/queryKeys';
import { NoChatsScreen } from './components/NoChatsScreen';

export const IndexPage: FC = () => {
  const { data: chats } = useQuery(queryKeys.chats.all);
  const hasChats = !!chats && chats.length > 0;

  if (!hasChats) {
    return <NoChatsScreen />;
  }

  return <h1>Welcome to emyht</h1>;
};
