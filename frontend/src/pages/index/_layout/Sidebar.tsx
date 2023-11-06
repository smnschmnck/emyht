import { UserData } from '@/api/userApi';
import { FC } from 'react';
import emyhtLogo from '@assets/images/emyht-logo.svg';
import { PlusIcon } from '@/assets/icons/PlusIcon';
import { Input } from '@/components/ui/Input';
import { MagnifyingGlassIcon } from '@/assets/icons/MagnifyingGlassIcon';
import { LogOutIcon } from '@/assets/icons/LogOutIcon';
import { IconButton } from '@/components/ui/IconButton';
import { SettingsIcon } from '@/assets/icons/SettingsIcon';

type SidebarProps = {
  userData: UserData;
};

export const Sidebar: FC<SidebarProps> = ({ userData }) => {
  return (
    <div className="flex h-full w-[28rem] flex-col justify-between border-r border-r-zinc-100">
      <div className="flex h-full w-full flex-col gap-8 px-6 py-8">
        <img className="w-24" src={emyhtLogo} alt="emyht" />
        <div className="flex flex-col gap-4">
          <div className="flex w-full justify-between">
            <h2 className="text-2xl font-medium">Chats</h2>
            <IconButton
              ariaLabel="Add chat"
              classOverrides="text-blue-500 hover:bg-blue-100"
            >
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
      </div>
      <div className="flex h-20 w-full items-center justify-between bg-blue-600 px-6 text-white">
        <div className="text-sm">
          <p className="font-semibold">{userData.username}</p>
          <p>{userData.email}</p>
        </div>
        <div className="flex gap-1">
          <IconButton ariaLabel="Settings">
            <SettingsIcon />
          </IconButton>
          <IconButton ariaLabel="Sign out">
            <LogOutIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
};
