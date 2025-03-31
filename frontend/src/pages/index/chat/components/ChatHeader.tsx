import { Avatar } from '@/components/ui/Avatar';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { HttpError } from '@/errors/httpError/httpError';
import { useChats } from '@/hooks/api/chats';
import { fetchWithDefaults } from '@/utils/fetch';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

export const ChatHeader: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: allChats } = useChats();
  const { data: chatInfo } = useQuery({
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

  const curChat = allChats?.find((c) => c.chatId === chatId);

  return (
    <div className="flex h-24 w-full items-center justify-between border-b border-b-zinc-100 bg-white px-8">
      <ButtonLink to="/" aria-label={'back'} className="h-8 w-8">
        <ChevronLeftIcon className="text-zinc-400" />
      </ButtonLink>
      <div className="flex h-full w-full items-center gap-3 px-4 lg:px-8">
        <Avatar imgUrl={curChat?.chatPictureUrl} alt={curChat?.chatName} />
        <div className="flex flex-col justify-center gap-0.5 text-sm">
          <div className="flex h-5 min-w-24 items-center">
            <h1 className="font-semibold">{curChat?.chatName}</h1>
          </div>
          <div className="flex h-5 min-w-24 items-center">
            <p className="text-zinc-500">{chatInfo?.info}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
