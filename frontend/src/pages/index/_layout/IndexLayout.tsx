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
import { useMediaQuery } from '@/hooks/utils/useMediaQuery';

export const IndexLayout: FC = () => {
  const { userData } = useRouteContext({ from: indexLayoutRoute.id });
  const { data: chats } = useQuery(queryKeys.chats.all);
  const isDesktopScreen = useMediaQuery('(min-width: 768px)');
  const { location } = useRouterState();

  //TODO Find out if there is a better way to check if a chat is opened
  const chatOpen = location.pathname.startsWith('/chat');
  const showChat = chatOpen || isDesktopScreen;
  const showSidebar = !chatOpen || isDesktopScreen;
  const hasChats = !!chats && chats.length > 0;

  return (
    <div className="flex h-screen">
      {showSidebar && <Sidebar userData={userData} />}
      {showChat && (
        <div className="h-full w-full">
          {!hasChats && <NoChatsScreen />}
          {hasChats && <Outlet />}
        </div>
      )}
    </div>
  );
};
