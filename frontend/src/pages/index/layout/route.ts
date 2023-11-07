import { rootRoute } from '@/router/config';
import { Route, redirect } from '@tanstack/react-router';
import { getUserData } from '@/api/userApi';
import { IndexLayout } from './IndexLayout';

export const indexLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  id: 'indexLayoutRoute',
  beforeLoad: async () => {
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
      userData,
    };
  },
  component: IndexLayout,
});
