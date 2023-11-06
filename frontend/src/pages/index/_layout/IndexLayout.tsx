import {
  Outlet,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router';
import { FC } from 'react';
import { indexLayoutRoute } from './route';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/configs/queryKeys';
import { NoChatsScreen } from './components/NoChatsScreen';
import { Sidebar } from './components/Sidebar';

export const IndexLayout: FC = () => {
  const { userData } = useRouteContext({ from: indexLayoutRoute.id });
  const { data: chats } = useQuery(queryKeys.chats.all);
  const { location } = useRouterState();

  //TODO Find out if there is a better way to check if a chat is opened
  const chatOpen = location.pathname.startsWith('/chat');
  const hasChats = (!!chats && chats.length > 0) || true;

  return (
    <div className="flex h-screen">
      <div
        className={
          chatOpen
            ? 'hidden h-full w-full lg:flex lg:w-[22rem]'
            : 'flex h-full w-full lg:flex lg:w-[22rem]'
        }
      >
        <Sidebar userData={userData} />
      </div>
      <div className={chatOpen ? 'block' : 'hidden lg:block'}>
        {!hasChats && <NoChatsScreen />}
        {hasChats && <Outlet />}
      </div>
    </div>
  );
};
