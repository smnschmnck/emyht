import { createRoute } from '@tanstack/react-router';
import { mainLayoutRoute } from '../mainLayout/route';
import { NoEmailPage } from './NoEmailPage';
import { FullPageLoader } from '@/components/FullPageLoader';

export const noEmailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  path: '/no-email',
  component: NoEmailPage,
  pendingComponent: FullPageLoader,
});
