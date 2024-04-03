import { createRoute } from '@tanstack/react-router';
import { indexLayoutRoute } from '../layout/route';
import { IndexPage } from './IndexPage';

export const indexRoute = createRoute({
  getParentRoute: () => indexLayoutRoute,
  path: '/',
  component: IndexPage,
});
