import { PusherContext } from '@/utils/pusher';
import { useContext, useRef } from 'react';
import type { Chat } from '../api/chats';

export const usePusher = () => {
  const { pusher } = useContext(PusherContext);
  const userFeedChannelRef = useRef<string | null>(null);

  const subscribe = (type: 'USER_FEED' | 'CHAT', id: string) => {
    if (!pusher) {
      throw new Error('Pusher not initialized');
    }

    const prefixes = {
      USER_FEED: 'private-user_feed',
      CHAT: 'private-chat',
    };

    return pusher.subscribe(`${prefixes[type]}.${id}`);
  };

  const subscribeToUserFeed = ({
    uuid,
    refetchChats,
    refetchContactRequests,
  }: {
    uuid?: string;
    refetchChats: () => void;
    refetchContactRequests: () => void;
  }) => {
    if (!uuid || !pusher) {
      return;
    }

    const channelName = `private-user_feed.${uuid}`;

    if (userFeedChannelRef.current && userFeedChannelRef.current !== channelName) {
      pusher.unsubscribe(userFeedChannelRef.current);
    }

    const channel = subscribe('USER_FEED', uuid);

    channel.unbind('chat').bind('chat', () => {
      refetchChats();
    });
    channel.unbind('contact_request').bind('contact_request', () => {
      refetchContactRequests();
    });
    channel.unbind('pusher:subscription_error').bind('pusher:subscription_error', (error: unknown) => {
      console.error('[Pusher] user feed subscription error', error);
    });

    userFeedChannelRef.current = channelName;
  };

  const subscribeToAllChats = ({
    chats = [],
    refetchChats,
    onNewMessage,
  }: {
    chats?: Chat[];
    refetchChats: () => void;
    onNewMessage: (chatId: string) => void;
  }) => {
    if (!pusher) {
      return;
    }

    chats.forEach(({ id }) => {
      const channel = subscribe('CHAT', id);

      channel.unbind('message').bind('message', () => {
        refetchChats();
        onNewMessage(id);
      });
      channel.unbind('pusher:subscription_error').bind('pusher:subscription_error', (error: unknown) => {
        console.error('[Pusher] chat subscription error', id, error);
      });
    });
  };

  return {
    pusher,
    subscribeToUserFeed,
    subscribeToAllChats,
  };
};
