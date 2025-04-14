import { Avatar } from '@/components/ui/Avatar';
import { IconLink } from '@/components/ui/IconLink';
import { HttpError } from '@/errors/httpError/httpError';
import { useCurrentChat } from '@/hooks/api/chats';
import { fetchWithDefaults } from '@/utils/fetch';
import {
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { FC } from 'react';

export const ChatHeader: FC<{ chatId: string }> = ({ chatId }) => {
  const curChat = useCurrentChat(chatId);
  const { data: chatInfo, isLoading: isLoadingChatInfo } = useQuery({
    queryKey: ['chatInfo', chatId],
    queryFn: async () => {
      const res = await fetchWithDefaults(`/chatInfo/${chatId}`);

      if (!res.ok) {
        throw new HttpError({
          message: await res.text(),
          statusCode: res.status,
        });
      }
      const json = (await res.json()) as {
        info: string;
      };

      return json;
    },
  });

  return (
    <div className="flex h-24 w-full items-center justify-between border-b border-b-zinc-100 bg-white px-8">
      <IconLink to="/" aria-label={'back'}>
        <ChevronLeftIcon className="text-zinc-400" />
      </IconLink>
      <div className="flex h-full w-full items-center">
        <Link
          to="/chat/$chatId/settings"
          params={{ chatId }}
          title="Chat settings"
          aria-label="Chat settings"
          className="flex gap-3 rounded-xl px-4 py-3 transition hover:bg-zinc-100"
        >
          <Avatar imgUrl={curChat?.chatPictureUrl} alt={curChat?.chatName} />
          <div className="flex flex-col justify-center gap-0.5 text-sm">
            <div className="flex h-5 min-w-24 items-center">
              <h1 className="font-semibold">{curChat?.chatName}</h1>
            </div>
            <div className="flex h-5 min-w-24 items-center">
              {!chatInfo && isLoadingChatInfo && (
                <div className="h-4 w-24 animate-pulse rounded-md bg-zinc-300"></div>
              )}
              {!!chatInfo?.info && (
                <p className="text-zinc-500">{chatInfo?.info}</p>
              )}
            </div>
          </div>
        </Link>
      </div>
      <IconLink
        to="/chat/$chatId/settings"
        params={{ chatId }}
        aria-label={'Chat settings'}
      >
        <EllipsisHorizontalIcon className="text-zinc-400" />
      </IconLink>
    </div>
  );
};
