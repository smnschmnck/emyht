import { IconButton } from '@/components/ui/IconButton';
import { queryKeys } from '@/configs/queryKeys';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import { useQuery } from '@tanstack/react-query';
import { FC } from 'react';
import { LogOutButton } from './LogOutButton';

export const UserInfoSection: FC = () => {
  const { data: userData } = useQuery(queryKeys.users.details);

  return (
    <div className="flex h-24 w-full items-center justify-between bg-blue-600 px-6 text-white">
      <div className="flex flex-col gap-1 text-sm">
        <p className="font-semibold">{userData?.username ?? ''}</p>
        <p>{userData?.email ?? ''}</p>
      </div>
      <div className="flex gap-1">
        <IconButton ariaLabel="Settings" className="text-white">
          <Cog6ToothIcon />
        </IconButton>
        <LogOutButton />
      </div>
    </div>
  );
};
