import { Outlet } from '@tanstack/react-router';
import { FC, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sidebar } from './components/Sidebar';
import { useChatId, useIsSidebarHidden } from './hooks';
import { useChats } from '@/hooks/api/chats';
import { usePusher } from '@/hooks/pusher/usePusher';
import { useUserData } from '@/hooks/api/user';
import { useContactRequests } from '@/hooks/api/contacts';
import { useChatMessages } from '@/hooks/api/messages';
import { indexLayoutRoute } from './route';

export const IndexLayout: FC = () => {
  const loaderUserData = indexLayoutRoute.useLoaderData();
  const { data: userData } = useUserData({ initialData: loaderUserData });
  const isSidebarHidden = useIsSidebarHidden();
  const { data: chats, refetch: refetchChats } = useChats();
  const { refetch: refetchContactRequests } = useContactRequests();
  const { pusher } = usePusher();
  const chatId = useChatId();
  const { refetch: refetchChatMessages } = useChatMessages(chatId);

  useEffect(() => {
    if (userData?.uuid) {
      pusher
        .subscribe(`private-user_feed.${userData.uuid}`)
        .bind('chat', () => {
          refetchChats();
        })
        .bind('contact_request', () => {
          refetchContactRequests();
        });
    }

    chats?.forEach((chat) => {
      pusher.subscribe(`private-chat.${chat.chatID}`).bind('message', () => {
        if (chat.chatID === chatId) {
          refetchChatMessages();
        }
        refetchChats();
      });
    });
  }, [pusher, chats, userData, chatId]);

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
