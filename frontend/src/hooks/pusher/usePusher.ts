import { PusherContext } from '@/utils/pusher';
import { useContext } from 'react';
import type { Chat } from '../api/chats';

export const usePusher = () => {
  const { pusher } = useContext(PusherContext);

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
      pusher
        .subscribe(`private-user_feed.${uuid}`)
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
    chats.forEach(({ chatID }) => {
      pusher
        .subscribe(`private-chat.${chatID}`)
        .unbind('message')
        .bind('message', () => {
          refetchChats();
          onNewMessage(chatID);
        });
    });
  };

  return {
    pusher,
    subscribeToUserFeed,
    subscribeToAllChats,
  };
};
