import { Route, redirect } from '@tanstack/react-router';
import { AuthLayout } from './AuthLayout';
import { mainLayoutRoute } from '@/pages/mainLayout/route';
import { getUserData } from '@/api/user';

export const authLayoutRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  id: 'authLayoutRoute',
  component: AuthLayout,
  beforeLoad: async () => {
    let userData;
    try {
      userData = await getUserData();
    } catch (e) {
      console.log(e);
      return;
    }
    if (userData.emailActive) {
      throw redirect({ to: '/' });
    }

    if (!userData.emailActive) {
      throw redirect({ to: '/no-email' });
    }
  },
});
