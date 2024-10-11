import { Outlet } from '@tanstack/react-router';
import { FC, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { Sidebar } from './components/Sidebar';
import { useIsSidebarHidden } from './hooks';
import { useChats } from '@/hooks/api/chats';
import { usePusher } from '@/hooks/pusher/usePusher';
import { useUserData } from '@/hooks/api/user';

export const IndexLayout: FC = () => {
  const isSidebarHidden = useIsSidebarHidden();
  const { data: chats } = useChats();
  const { data: userData } = useUserData();
  const { pusher } = usePusher();

  useEffect(() => {
    if (userData?.uuid) {
      pusher.subscribe(`private-user_feed:${userData.uuid}`);
    }

    chats?.forEach((chat) => {
      pusher.subscribe(`private-chat:${chat.chatID}`);
    });
  }, [pusher, chats, userData]);

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
