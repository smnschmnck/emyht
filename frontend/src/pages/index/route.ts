import { rootRoute } from '@/router/config';
import { Route, redirect } from '@tanstack/react-router';
import { IndexPage } from './IndexPage';
import { getUserData } from '@/api/userApi';

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: IndexPage,
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

    return userData;
  },
});
