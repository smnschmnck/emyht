import { FullPageLoader } from '@/components/FullPageLoader';
import { useChats } from '@/hooks/api/chats';
import { useContactRequests } from '@/hooks/api/contacts';
import { useChatMessages } from '@/hooks/api/messages';
import { useUserData } from '@/hooks/api/user';
import { usePusher } from '@/hooks/pusher/usePusher';
import { useAuth0 } from '@auth0/auth0-react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { FC, useEffect } from 'react';
import { twMerge } from 'tailwind-merge';
import { useChatInfo } from '../chat/hooks/useChatInfo';
import { Sidebar } from './components/Sidebar';
import { useChatId, useIsSidebarHidden } from './hooks';

export const IndexLayout: FC = () => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    loginWithRedirect,
  } = useAuth0();
  const navigate = useNavigate();
  const { data: userData, isLoading: isUserLoading } = useUserData({
    enabled: isAuthenticated,
  });
  const isSidebarHidden = useIsSidebarHidden();
  const { data: chats, refetch: refetchChats } = useChats();
  const chatId = useChatId();
  const { data: info } = useChatInfo({ chatId });
  const { refetch: refetchMessages } = useChatMessages(chatId);
  const { refetch: refetchContactRequests } = useContactRequests();
  const { subscribeToUserFeed, subscribeToAllChats } = usePusher();

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthLoading, isAuthenticated, loginWithRedirect]);

  useEffect(() => {
    if (userData && !userData.emailActive) {
      navigate({ to: '/no-email', replace: true });
    }
  }, [userData, navigate]);

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

  if (isAuthLoading || isUserLoading) {
    return <FullPageLoader />;
  }

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
