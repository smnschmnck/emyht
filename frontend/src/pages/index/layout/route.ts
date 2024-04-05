import { getUserData } from '@/api/user';
import { rootRoute } from '@/router/config';
import { createRoute, redirect } from '@tanstack/react-router';
import { IndexLayout } from './IndexLayout';

export const indexLayoutRoute = createRoute({
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
  },
  component: IndexLayout,
});
