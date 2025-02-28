import { getUserData } from '@/api/user';
import { mainLayoutRoute } from '@/pages/mainLayout/route';
import { createRoute, redirect } from '@tanstack/react-router';
import { AuthLayout } from './AuthLayout';
import { FullPageLoader } from '@/components/FullPageLoader';

export const authLayoutRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  id: 'authLayoutRoute',
  component: AuthLayout,
  loader: async () => {
    let userData;
    try {
      userData = await getUserData();
    } catch {
      return;
    }
    if (userData.emailActive) {
      throw redirect({ to: '/' });
    }

    if (!userData.emailActive) {
      throw redirect({ to: '/no-email' });
    }
  },
  pendingComponent: FullPageLoader,
});
