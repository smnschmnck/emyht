import {
  Outlet,
  useRouteContext,
  useRouterState,
} from '@tanstack/react-router';
import { FC } from 'react';
import { indexLayoutRoute } from './route';
import { Sidebar } from './components/Sidebar';

export const IndexLayout: FC = () => {
  const { userData } = useRouteContext({ from: indexLayoutRoute.id });
  const { location } = useRouterState();

  const chatOpen = location.pathname.startsWith('/chat');

  return (
    <div className="flex h-screen">
      <div
        className={
          chatOpen
            ? 'hidden h-full w-full lg:flex lg:w-[22rem]'
            : 'flex h-full w-full lg:flex lg:w-[22rem]'
        }
      >
        <Sidebar userData={userData} />
      </div>
      <div
        className={
          chatOpen ? 'block h-full w-full' : 'hidden h-full w-full lg:block'
        }
      >
        <Outlet />
      </div>
    </div>
  );
};
