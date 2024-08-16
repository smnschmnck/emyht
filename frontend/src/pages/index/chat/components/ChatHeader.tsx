import { Avatar } from '@/components/ui/Avatar';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { IconButton } from '@/components/ui/IconButton';
import { HttpError } from '@/errors/httpError/httpError';
import { useChats } from '@/hooks/api/chats';
import { fetchWithDefaults } from '@/utils/fetch';
import {
  ChevronLeftIcon,
  EllipsisHorizontalIcon,
} from '@heroicons/react/24/outline';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

const DropdownOptions: FC = () => {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <IconButton ariaLabel={'Chat settings'} className="h-8 w-8">
          <EllipsisHorizontalIcon className="text-zinc-400" />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="rounded-md border bg-white p-1 shadow-sm"
          align="end"
        >
          <DropdownMenu.Item className="flex h-8 w-32 cursor-pointer items-center rounded-sm pl-3 text-sm font-medium outline-none data-[highlighted]:bg-blue-50">
            Leave
          </DropdownMenu.Item>
          <DropdownMenu.Item className="flex h-8 w-32 cursor-pointer items-center rounded-sm pl-3 text-sm font-medium outline-none data-[highlighted]:bg-blue-50">
            Invite
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
};

export const ChatHeader: FC<{ chatId: string }> = ({ chatId }) => {
  const { data: allChats } = useChats();
  const { data: chatInfo } = useQuery({
    queryKey: ['chatInfo', chatId],
    queryFn: async () => {
      const res = await fetchWithDefaults('/chatInfo/${chatId}');

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
      <DropdownOptions />
    </div>
  );
};
