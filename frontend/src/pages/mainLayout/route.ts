import { rootRoute } from '@/router/config';
import { Route } from '@tanstack/react-router';
import { MainLayout } from './MainLayout';

export const mainLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  id: 'mainLayout',
  component: MainLayout,
});
