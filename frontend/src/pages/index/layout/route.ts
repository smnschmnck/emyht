import { rootRoute } from '@/router/config';
import { Route, redirect } from '@tanstack/react-router';
import { IndexLayout } from './IndexLayout';
import { getUserData } from '@/api/user';
import { env } from '@/env';

export const indexLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  id: 'indexLayoutRoute',
  loader: async () => {
    let userData;
    try {
      userData = await getUserData();
    } catch (e) {
      throw redirect({ to: '/sign-in' });
    }

    if (!userData.emailActive) {
      throw redirect({ to: '/no-email' });
    }

    return {
      webSocket: new WebSocket(env.VITE_WEBSOCKET_HOST),
    };
  },
  component: IndexLayout,
});
