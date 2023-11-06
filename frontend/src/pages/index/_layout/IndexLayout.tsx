import { Outlet, useRouteContext } from '@tanstack/react-router';
import { FC } from 'react';
import { indexLayoutRoute } from './route';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/configs/queryKeys';
import { NoChatsScreen } from './NoChatsScreen';
import { Sidebar } from './Sidebar';

export const IndexLayout: FC = () => {
  const { userData } = useRouteContext({ from: indexLayoutRoute.id });
  const { data: chats } = useQuery(queryKeys.chats.all);

  const hasChats = !!chats && chats.length > 0;

  return (
    <div className="flex h-screen">
      <Sidebar userData={userData} />
      {!hasChats && <NoChatsScreen />}
      {hasChats && <Outlet />}
    </div>
  );
};
