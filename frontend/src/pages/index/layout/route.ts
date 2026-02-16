import { FullPageLoader } from '@/components/FullPageLoader';
import { rootRoute } from '@/router/config';
import { createRoute } from '@tanstack/react-router';
import { IndexLayout } from './IndexLayout';

export const indexLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'indexLayoutRoute',
  pendingComponent: FullPageLoader,
  component: IndexLayout,
});
