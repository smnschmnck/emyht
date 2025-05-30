import { useChats } from '@/hooks/api/chats';
import { useContactRequests } from '@/hooks/api/contacts';
import { useUserData } from '@/hooks/api/user';
import { usePusher } from '@/hooks/pusher/usePusher';
import { Outlet } from '@tanstack/react-router';
import { FC, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sidebar } from './components/Sidebar';
import { useChatId, useIsSidebarHidden } from './hooks';
import { indexLayoutRoute } from './route';
import { useChatMessages } from '@/hooks/api/messages';
import { useChatInfo } from '../chat/hooks/useChatInfo';

export const IndexLayout: FC = () => {
  const loaderUserData = indexLayoutRoute.useLoaderData();
  const { data: userData } = useUserData({ initialData: loaderUserData });
  const isSidebarHidden = useIsSidebarHidden();
  const { data: chats, refetch: refetchChats } = useChats();
  const chatId = useChatId();
  const { data: info } = useChatInfo({ chatId });
  const { refetch: refetchMessages } = useChatMessages(chatId);
  const { refetch: refetchContactRequests } = useContactRequests();
  const { subscribeToUserFeed, subscribeToAllChats } = usePusher();

  useEffect(() => {
    subscribeToUserFeed({
      uuid: userData?.uuid,
      refetchChats,
      refetchContactRequests,
    });

    subscribeToAllChats({
      chats,
      refetchChats,
      onNewMessage: (channelChatId: string) => {
        if (info?.isChatBlocked) {
          return;
        }
        if (channelChatId === chatId) {
          refetchMessages();
        }
      },
    });
  }, [
    chats,
    userData,
    chatId,
    subscribeToUserFeed,
    refetchChats,
    refetchContactRequests,
    subscribeToAllChats,
    refetchMessages,
    info?.isChatBlocked,
  ]);

  return (
    <div className="flex h-full">
      <div
        className={twMerge(
          'h-full w-full lg:flex lg:max-w-[22rem] lg:min-w-[22rem]',
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
