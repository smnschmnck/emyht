import { PusherContext } from '@/utils/pusher';
import { useContext } from 'react';
import type { Chat } from '../api/chats';

export const usePusher = () => {
  const { pusher } = useContext(PusherContext);

  const subscribe = (type: 'USER_FEED' | 'CHAT', id: string) => {
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
    if (uuid) {
      subscribe('USER_FEED', uuid)
        .unbind('chat')
        .bind('chat', () => {
          refetchChats();
        })
        .unbind('contact_request')
        .bind('contact_request', () => {
          refetchContactRequests();
        });
    }
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
    chats.forEach(({ chatId }) => {
      subscribe('CHAT', chatId)
        .unbind('message')
        .bind('message', () => {
          refetchChats();
          onNewMessage(chatId);
        });
    });
  };

  return {
    pusher,
    subscribeToUserFeed,
    subscribeToAllChats,
  };
};
