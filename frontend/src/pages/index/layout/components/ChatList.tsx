import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Bagde';
import { Link } from '@/components/ui/Link';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/Spinner';
import { Chat, useChats } from '@/hooks/api/chats';
import { formatTimestamp } from '@/utils/dateUtils';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { Link as RouterLink } from '@tanstack/react-router';
import { FC, useEffect, useState } from 'react';

type SingleChatProps = {
  chat: Chat;
};

const SingleChat: FC<SingleChatProps> = ({ chat }) => (
  <li>
    <RouterLink
      className="flex w-full items-center gap-3 rounded-lg p-3 transition hover:bg-zinc-100 data-[status=active]:bg-zinc-100"
      to="/chat/$chatId"
      params={{ chatId: chat.chatID }}
    >
      <div className="relative">
        {chat.unreadMessages > 0 && <Badge>{''}</Badge>}
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

const useDataChangeDetector = <T,>({
  data,
  onChange,
  onNoChange,
}: {
  data: T;
  onChange: () => void;
  onNoChange?: () => void;
}) => {
  const [prevData, setPrevData] = useState(data);

  useEffect(() => {
    if (
      prevData !== null &&
      prevData !== undefined &&
      JSON.stringify(prevData) !== JSON.stringify(data)
    ) {
      onChange();
    } else {
      onNoChange?.();
    }

    setPrevData(data);
  }, [data, prevData, onChange, onNoChange]);
};

export const ChatList: FC = () => {
  const { data: chats, isLoading: isLoadingChats } = useChats();
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
        <SearchInput
          onChange={(e) => setChatSearchQuery(e.target.value)}
          value={chatSearchQuery}
          placeholder="Search chats"
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
          <ul
            className="flex h-1 w-full grow flex-col gap-1"
            ref={animationParent}
          >
            {filteredChats.map((c) => (
              <SingleChat key={c.chatID} chat={c} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
