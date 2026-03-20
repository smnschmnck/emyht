import { FullPageLoader } from '@/components/FullPageLoader';
import { useChats } from '@/hooks/api/chats';
import { useContactRequests } from '@/hooks/api/contacts';
import { useChatMessages } from '@/hooks/api/messages';
import { useCurrentUser } from '@/hooks/api/user';
import { usePusher } from '@/hooks/pusher/usePusher';
import { useAuth0 } from '@auth0/auth0-react';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { FC, useEffect, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { useChatInfo } from '../chat/hooks/useChatInfo';
import { Sidebar } from './components/Sidebar';
import { useChatId, useIsSidebarHidden } from './hooks';

const useAuthError = () => {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    if (error === 'access_denied') {
      return true;
    }
    return false;
  }, []);
};

export const IndexLayout: FC = () => {
  const {
    isAuthenticated,
    isLoading: isAuthLoading,
    loginWithRedirect,
  } = useAuth0();
  const authError = useAuthError();
  const navigate = useNavigate();
  const isSidebarHidden = useIsSidebarHidden();
  const { data: chats, refetch: refetchChats } = useChats();
  const chatId = useChatId();
  const { data: info } = useChatInfo({ chatId });
  const { refetch: refetchMessages } = useChatMessages(chatId);
  const { refetch: refetchContactRequests } = useContactRequests();
  const { subscribeToUserFeed, subscribeToAllChats } = usePusher();
  const { data: currentUser } = useCurrentUser();

  useEffect(() => {
    if (authError) {
      navigate({ to: '/no-email' });
      return;
    }
    if (!isAuthLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isAuthLoading, isAuthenticated, loginWithRedirect, authError, navigate]);

  useEffect(() => {
    subscribeToUserFeed({
      uuid: currentUser?.uuid,
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
    currentUser,
    chatId,
    subscribeToUserFeed,
    refetchChats,
    refetchContactRequests,
    subscribeToAllChats,
    refetchMessages,
    info?.isChatBlocked,
  ]);

  if (isAuthLoading || authError) {
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
