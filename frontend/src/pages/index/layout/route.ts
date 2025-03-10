import { getUserData } from '@/api/user';
import { FullPageLoader } from '@/components/FullPageLoader';
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
    } catch {
      throw redirect({ to: '/sign-in' });
    }

    if (!userData.emailActive) {
      throw redirect({ to: '/no-email' });
    }

    return userData;
  },
  pendingComponent: FullPageLoader,
  component: IndexLayout,
});
