import { useRouteContext } from '@tanstack/react-router';
import { FC } from 'react';
import { indexRoute } from './route';

export const IndexPage: FC = () => {
  const userData = useRouteContext({ from: indexRoute.id });

  return (
    <div>
      <h1>Hello {userData.username}</h1>
      <h1>Email Active: {String(userData.emailActive)}</h1>
    </div>
  );
};
