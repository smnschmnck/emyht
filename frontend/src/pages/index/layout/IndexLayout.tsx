import { WebSocketContext } from '@/App';
import { handleWebsocketMessage } from '@/utils/websocket/handleWebsocketMessage';
import { useQueryClient } from '@tanstack/react-query';
import { Outlet } from '@tanstack/react-router';
import { FC, useContext } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sidebar } from './components/Sidebar';
import { useChatId, useIsSidebarHidden } from './hooks';

export const IndexLayout: FC = () => {
  const isSidebarHidden = useIsSidebarHidden();
  const chatId = useChatId();
  const queryClient = useQueryClient();

  const { webSocket, isAuthenticated, setIsAuthenticated } =
    useContext(WebSocketContext);

  if (webSocket) {
    if (!isAuthenticated) {
      webSocket.send('AUTH');
    }
    webSocket.onmessage = (msg) => {
      handleWebsocketMessage(msg, queryClient, setIsAuthenticated, chatId);
    };
  }

  return (
    <div className="flex h-full">
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
