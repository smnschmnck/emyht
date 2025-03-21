import { getUserData } from '@/api/user';
import { createRoute, redirect } from '@tanstack/react-router';
import { mainLayoutRoute } from '../mainLayout/route';
import { NoEmailPage } from './NoEmailPage';
import { FullPageLoader } from '@/components/FullPageLoader';

export const noEmailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/no-email',
  component: NoEmailPage,
  beforeLoad: async () => {
    let userData;
    try {
      userData = await getUserData();
    } catch {
      throw redirect({ to: '/sign-in' });
    }

    if (userData.emailActive) {
      throw redirect({ to: '/' });
    }

    return userData;
  },
  pendingComponent: FullPageLoader,
});
