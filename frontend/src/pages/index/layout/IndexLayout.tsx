import { handleWebsocketMessage } from '@/websocket/handleWebsocketMessage';
import { useQueryClient } from '@tanstack/react-query';
import { Outlet, useLoader } from '@tanstack/react-router';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sidebar } from './components/Sidebar';
import { indexLayoutRoute } from './route';
import { useChatId, useIsSidebarHidden } from './hooks';

export const IndexLayout: FC = () => {
  const isSidebarHidden = useIsSidebarHidden();
  const chatId = useChatId();
  const { webSocket } = useLoader({ from: indexLayoutRoute.id });
  const queryClient = useQueryClient();

  webSocket.onmessage = (msg) => {
    handleWebsocketMessage(msg, queryClient, chatId);
  };

  return (
    <div className="flex h-screen">
      <div
        className={twMerge(
          'h-full w-full lg:flex lg:min-w-[22rem] lg:max-w-[22rem]',
          isSidebarHidden ? 'hidden' : 'flex'
        )}
      >
        <Sidebar />
      </div>
      <div
        className={twMerge(
          'h-full w-full bg-slate-50',
          isSidebarHidden ? 'block' : 'hidden lg:block'
        )}
      >
        <Outlet />
      </div>
    </div>
  );
};
