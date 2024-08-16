import { WebSocketContext } from '@/App';
import { handleWebsocketMessage } from '@/utils/websocket/handleWebsocketMessage';
import { Outlet } from '@tanstack/react-router';
import { FC, useContext } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sidebar } from './components/Sidebar';
import { useChatId, useIsSidebarHidden } from './hooks';
import { useChats } from '@/hooks/api/chats';
import { useChatMessages } from '@/hooks/api/messages';
import { useContactRequests } from '@/hooks/api/contacts';

export const IndexLayout: FC = () => {
  const isSidebarHidden = useIsSidebarHidden();
  const chatId = useChatId();
  const { refetch: refetchChats } = useChats();
  const { refetch: refetchChatMessages } = useChatMessages(chatId);
  const { refetch: refetchContactRequests } = useContactRequests();

  const { webSocket, isAuthenticated, setIsAuthenticated, isReady } =
    useContext(WebSocketContext);

  if (webSocket && isReady) {
    if (!isAuthenticated) {
      webSocket.send('AUTH');
    }
    webSocket.onmessage = (msg) => {
      handleWebsocketMessage({
        msg,
        setIsAuthenticated,
        refetchChatMessages,
        chatId,
        refetchChats,
        refetchContactRequests,
      });
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
