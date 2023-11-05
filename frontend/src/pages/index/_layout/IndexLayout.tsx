import { Outlet, useRouteContext } from '@tanstack/react-router';
import { FC } from 'react';
import { indexLayoutRoute } from './route';

export const IndexLayout: FC = () => {
  const { userData } = useRouteContext({ from: indexLayoutRoute.id });

  return (
    <div>
      <h1>Hello {userData.username}</h1>
      <h1>Email Active: {String(userData.emailActive)}</h1>
      <Outlet />
    </div>
  );
};
