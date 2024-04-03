import { rootRoute } from '@/router/config';
import { createRoute } from '@tanstack/react-router';
import { MainLayout } from './MainLayout';

export const mainLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'mainLayout',
  component: MainLayout,
});
