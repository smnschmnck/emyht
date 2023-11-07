import { UserData } from '@/api/userApi';
import { LogOutIcon } from '@/assets/icons/LogOutIcon';
import { MagnifyingGlassIcon } from '@/assets/icons/MagnifyingGlassIcon';
import { PlusIcon } from '@/assets/icons/PlusIcon';
import { SettingsIcon } from '@/assets/icons/SettingsIcon';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
import { queryKeys } from '@/configs/queryKeys';
import emyhtLogo from '@assets/images/emyht-logo.svg';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';

type SidebarProps = {
  userData: UserData;
};

export const Sidebar: FC<SidebarProps> = ({ userData }) => {
  const { data: chats } = useQuery(queryKeys.chats.all);
  const hasChats = !!chats && chats.length > 0;

  return (
    <div className="flex h-full w-full flex-col justify-between border-r border-r-zinc-100">
      <div className="flex h-full w-full flex-col gap-8 px-6 py-8">
        <img className="w-24" src={emyhtLogo} alt="emyht" />
        <div className="flex flex-col gap-4">
          <div className="flex w-full justify-between">
            <h2 className="text-2xl font-semibold">Chats</h2>
            <IconButton ariaLabel="Add chat">
              <PlusIcon />
            </IconButton>
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
          {!hasChats && <p>no chats :(</p>}
          {hasChats && chats.map((c) => <p>{c.chatName}</p>)}
        </div>
      </div>
      <div className="flex h-24 w-full items-center justify-between bg-blue-600 px-6 text-white">
        <div className="flex flex-col gap-1 text-sm">
          <p className="font-semibold">{userData.username}</p>
          <p>{userData.email}</p>
        </div>
        <div className="flex gap-1">
          <IconButton ariaLabel="Settings" className="text-white">
            <SettingsIcon />
          </IconButton>
          <IconButton ariaLabel="Sign out" className="text-white">
            <LogOutIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
