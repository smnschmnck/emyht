import { Route, redirect } from '@tanstack/react-router';
import { NoEmailPage } from './NoEmailPage';
import { mainLayoutRoute } from '../mainLayout/route';
import { getUserData } from '@/api/user';

export const noEmailRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  path: '/no-email',
  component: NoEmailPage,
  beforeLoad: async () => {
    let userData;
    try {
      userData = await getUserData();
    } catch (e) {
      throw redirect({ to: '/sign-in' });
    }

    if (userData.emailActive) {
      throw redirect({ to: '/' });
    }

    return userData;
  },
});
