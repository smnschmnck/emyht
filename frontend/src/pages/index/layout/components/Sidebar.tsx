import emyhtLogo from '@assets/images/emyht-logo.svg';
import { Link as RouterLink } from '@tanstack/react-router';

import { ChatList } from './ChatList';
import { InitLinks } from './InitLinks';
import { UserInfoSection } from './UserInfoSection';

export const Sidebar = () => {
  return (
    <div className="flex h-full w-full flex-col justify-between border-r border-r-zinc-100">
      <div className="flex h-full w-full flex-col gap-8 px-6 pt-8">
        <RouterLink to="/" className="w-fit">
          <img className="w-24" src={emyhtLogo} alt="emyht" />
        </RouterLink>
        <div className="flex h-full w-full flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Chats</h2>
            <InitLinks />
          </div>
          <ChatList />
        </div>
      </div>
      <UserInfoSection />
    </div>
  );
};
