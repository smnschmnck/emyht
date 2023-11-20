import { Outlet, useRouter, useRouterState } from '@tanstack/react-router';
import { FC } from 'react';
import { Sidebar } from './components/Sidebar';
import { twMerge } from 'tailwind-merge';

const useIsChatRoute = () => {
  const { routesByPath } = useRouter();
  const { location } = useRouterState();

  const hideRoutes = [
    routesByPath['/initiate'].fullPath,
    routesByPath['/incoming-requests'].fullPath,
    '/chat/',
  ];

  const idx = hideRoutes.findIndex((r) => location.pathname.startsWith(r));

  return idx !== -1;
};

export const IndexLayout: FC = () => {
  const isChatRoute = useIsChatRoute();

  return (
    <div className="flex h-screen">
      <div
        className={twMerge(
          'h-full w-full lg:flex lg:min-w-[22rem] lg:max-w-[22rem]',
          isChatRoute ? 'hidden' : 'flex'
        )}
      >
        <Sidebar />
      </div>
      <div
        className={twMerge(
          'h-full w-full bg-slate-50',
          isChatRoute ? 'block' : 'hidden lg:block'
        )}
      >
        <Outlet />
      </div>
    </div>
  );
};
