import { Route } from '@tanstack/react-router';
import { IndexPage } from './IndexPage';
import { indexLayoutRoute } from '../_layout/route';

export const indexRoute = new Route({
  getParentRoute: () => indexLayoutRoute,
  path: '/',
  component: IndexPage,
});
