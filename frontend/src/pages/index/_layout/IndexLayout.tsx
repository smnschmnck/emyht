import {
  Outlet,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router';
import { FC } from 'react';
import { indexLayoutRoute } from './route';
import { Sidebar } from './components/Sidebar';
import { twMerge } from 'tailwind-merge';

export const IndexLayout: FC = () => {
  const { userData } = useRouteContext({ from: indexLayoutRoute.id });
  const { location } = useRouterState();

  const chatOpen = location.pathname.startsWith('/chat');

  return (
    <div className="flex h-screen">
      <div
        className={twMerge(
          'h-full w-full lg:flex lg:min-w-[22rem] lg:max-w-[22rem]',
          chatOpen ? 'hidden' : 'flex'
        )}
      >
        <Sidebar userData={userData} />
      </div>
      <div
        className={twMerge(
          'h-full w-full',
          chatOpen ? 'block' : 'hidden lg:block'
        )}
      >
        <Outlet />
      </div>
    </div>
  );
};
