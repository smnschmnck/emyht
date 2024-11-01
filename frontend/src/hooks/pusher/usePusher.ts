import { PusherContext } from '@/utils/pusher';
import { useContext, useState } from 'react';
import { Chat } from '../api/chats';

export const usePusher = () => {
  const { pusher } = useContext(PusherContext);
  const [isSubscribedToUserFeed, setIsSubscribedToUserFeed] = useState(false);
  const [subscribedChats, setSubscribedChats] = useState<string[]>([]);

  const subscribeToUserFeed = ({
    uuid,
    refetchChats,
    refetchContactRequests,
  }: {
    uuid?: string;
    refetchChats: () => void;
    refetchContactRequests: () => void;
  }) => {
    if (isSubscribedToUserFeed) {
      return;
    }

    if (uuid) {
      pusher
        .subscribe(`private-user_feed.${uuid}`)
        .bind('chat', () => {
          refetchChats();
        })
        .bind('contact_request', () => {
          refetchContactRequests();
        });

      setIsSubscribedToUserFeed(true);
    }
  };

  const subscribeToAllChats = ({
    chats = [],
    refetchChats,
  }: {
    chats?: Chat[];
    refetchChats: () => void;
  }) => {
    const newChatIds = chats.map((chat) => chat.chatID);
    const unsubscribedChats = newChatIds.filter(
      (chatId) => !subscribedChats.includes(chatId)
    );

    unsubscribedChats.forEach((chatId) => {
      pusher.subscribe(`private-chat.${chatId}`).bind('message', () => {
        refetchChats();
      });
    });

    const subscribedChatsSet = new Set([...subscribedChats, ...newChatIds]);
    const updatedSubscribedChats = Array.from(subscribedChatsSet.keys());
    setSubscribedChats(updatedSubscribedChats);
  };

  return { pusher, subscribeToUserFeed, subscribeToAllChats };
};
