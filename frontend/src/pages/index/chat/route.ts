import { Route } from '@tanstack/react-router';
import { indexLayoutRoute } from '../_layout/route';

export const chatRoute = new Route({
  getParentRoute: () => indexLayoutRoute,
  path: '/chat',
});
