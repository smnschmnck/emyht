import { Avatar } from '@/components/ui/Avatar';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { IconButton } from '@/components/ui/IconButton';
import { queryKeys } from '@/configs/queryKeys';
import {
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

export const ChatHeader: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: allChats } = useQuery(queryKeys.chats.all);
  const { data: chatInfo } = useQuery(queryKeys.chats.info(chatId));

  const curChat = allChats?.find((c) => c.chatID === chatId);

  return (
    <div className="flex h-24 w-full items-center justify-between border-b border-b-zinc-100 bg-white px-8">
      <ButtonLink to="/" aria-label={'back'} className="h-8 w-8">
        <ChevronLeftIcon className="text-zinc-400" />
      </ButtonLink>
      <div className="flex h-full w-full">
        <div className="flex w-1/2 items-center justify-end px-1">
          <Avatar imgUrl={curChat?.pictureUrl} alt={curChat?.chatName} />
        </div>
        <div className="flex flex-col justify-center px-1 text-sm">
          <h1 className="font-semibold">{curChat?.chatName}</h1>
          <p className="text-zinc-500">{chatInfo?.info}</p>
        </div>
      </div>
      <IconButton ariaLabel={'Chat settings'} className="h-8 w-8">
        <EllipsisHorizontalIcon className="text-zinc-400" />
      </IconButton>
    </div>
  );
};
