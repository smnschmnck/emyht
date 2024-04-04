import { Chat } from '@/api/chats';
import { Avatar } from '@/components/ui/Avatar';
import { Input } from '@/components/ui/Input';
import { Link } from '@/components/ui/Link';
import { queryKeys } from '@/configs/queryKeys';
import { useDataChangeDetector } from '@/hooks/api/useDataChangeDetector';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { FC, useState } from 'react';
import { Link as RouterLink } from '@tanstack/react-router';
import { Spinner } from '@/components/ui/Spinner';
import { formatTimestamp } from '@/utils/dateUtils';

type SingleChatProps = {
  chat: Chat;
};

const SingleChat: FC<SingleChatProps> = ({ chat }) => (
  <li>
    <RouterLink
      className="flex w-full items-center gap-3 border-b border-b-zinc-100 px-2 py-3 transition hover:bg-zinc-100"
      to="/chat/$chatId"
      params={{ chatId: chat.chatID }}
    >
      <div className="relative">
        {chat.unreadMessages > 0 && (
          <div className="absolute -left-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-xs font-medium text-white">
            {chat.unreadMessages}
          </div>
        )}
        <Avatar imgUrl={chat.pictureUrl} />
      </div>
      <div className="w-full truncate text-sm">
        <div className="flex w-full items-center justify-between">
          <p className="font-semibold">{chat.chatName}</p>
          <p className="text-xs text-zinc-400">
            {formatTimestamp(Number(chat.timestamp))}
          </p>
        </div>
        <p className="truncate text-zinc-500">
          {chat.textContent ?? `Send a message to ${chat.chatName}`}
        </p>
      </div>
    </RouterLink>
  </li>
);

export const ChatList: FC = () => {
  const { data: chats, isLoading: isLoadingChats } = useQuery(
    queryKeys.chats.all
  );
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [animationParent, enable] = useAutoAnimate();

  const filteredChats = chats?.filter((chat) => {
    const chatLowerCase = chat.chatName.toLowerCase();
    const queryLowerCase = chatSearchQuery.toLowerCase();

    return chatLowerCase.includes(queryLowerCase);
  });

  const hasChats = !!filteredChats && filteredChats.length > 0;

  useDataChangeDetector({
    data: chats,
    onChange: () => {
      enable(true);
    },
    onNoChange: () => {
      enable(false);
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-4">
      <div>
        <Input
          onChange={(e) => setChatSearchQuery(e.target.value)}
          value={chatSearchQuery}
          placeholder="Search chats"
          startAdornment={
            <div className="text-zinc-500">
              <MagnifyingGlassIcon className="h-4 w-4" />
            </div>
          }
        />
      </div>
      <div className="flex h-full w-full justify-center overflow-y-scroll">
        {!hasChats && isLoadingChats && (
          <div className="flex h-full w-full items-center justify-center">
            <Spinner />
          </div>
        )}
        {!hasChats && !isLoadingChats && (
          <div className="flex w-full flex-col items-center justify-center">
            <p className="text-lg font-medium">No chats</p>
            <Link to="/initiate">Start new chat</Link>
          </div>
        )}
        {hasChats && (
          <ul className="flex h-1 w-full grow flex-col" ref={animationParent}>
            {filteredChats.map((c) => (
              <SingleChat key={c.chatID} chat={c} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
