import { MagnifyingGlassIcon } from '@/assets/icons/MagnifyingGlassIcon';
import { PlusIcon } from '@/assets/icons/PlusIcon';
import { SettingsIcon } from '@/assets/icons/SettingsIcon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { queryKeys } from '@/configs/queryKeys';
import emyhtLogo from '@assets/images/emyht-logo.svg';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { LogOutButton } from './LogOutButton';
import { MakeLinkOptions, Link as RouterLink } from '@tanstack/react-router';
import { Link } from '@/components/ui/Link';
import { UsersIcon } from '@/assets/icons/UsersIcon';
import { Badge } from '@/components/ui/Bagde';

const ButtonLink: FC<MakeLinkOptions> = (props) => (
  <RouterLink
    className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-white text-blue-600 hover:bg-blue-100"
    {...props}
  />
);

export const Sidebar = () => {
  const { data: chats } = useQuery(queryKeys.chats.all);
  const { data: userData } = useQuery(queryKeys.users.details);
  const { data: contactRequests } = useQuery(
    queryKeys.contacts.incomingRequests
  );

  const hasChats = !!chats && chats.length > 0;

  const hasContactRequests = !!contactRequests && contactRequests.length > 0;

  return (
    <div className="flex h-full w-full flex-col justify-between border-r border-r-zinc-100">
      <div className="flex h-full w-full flex-col gap-8 px-6 py-8">
        <RouterLink to="/" className="w-fit">
          <img className="w-24" src={emyhtLogo} alt="emyht" />
        </RouterLink>
        <div className="flex flex-col gap-4">
          <div className="flex w-full justify-between">
            <h2 className="text-2xl font-semibold">Chats</h2>
            <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-1">
              <div className="relative">
                {hasContactRequests && (
                  <Badge size="sm">{contactRequests.length}</Badge>
                )}
                <ButtonLink to="/incoming-requests" aria-label="Start new chat">
                  <UsersIcon />
                </ButtonLink>
              </div>
              <hr className="h-3/4 w-0.5 rounded-full bg-zinc-300" />
              <ButtonLink to="/initiate" aria-label="Start new chat">
                <PlusIcon />
              </ButtonLink>
            </div>
          </div>
          <Input
            placeholder="Search chats"
            startAdornment={
              <div className="text-zinc-500">
                <MagnifyingGlassIcon />
              </div>
            }
          />
        </div>
        <div className="flex h-full w-full items-center justify-center">
          {!hasChats && (
            <div className="flex flex-col items-center justify-center">
              <p className="text-lg font-medium">No chats</p>
              <Link to="/initiate">Start new chat</Link>
            </div>
          )}
          {hasChats && chats.map((c) => <p key={c.chatID}>{c.chatName}</p>)}
        </div>
      </div>
      <div className="flex h-24 w-full items-center justify-between bg-blue-600 px-6 text-white">
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-semibold">{userData?.username ?? ''}</p>
          <p>{userData?.email ?? ''}</p>
        </div>
        <div className="flex gap-1">
          <IconButton ariaLabel="Settings" className="text-white">
            <SettingsIcon />
          </IconButton>
          <LogOutButton />
        </div>
      </div>
    </div>
  );
};
