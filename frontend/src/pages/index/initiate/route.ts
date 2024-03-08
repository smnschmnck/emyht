import { Route } from '@tanstack/react-router';
import { InitiationView } from './Initiate';
import { indexLayoutRoute } from '../layout/route';

export const initiateRoute = new Route({
  getParentRoute: () => indexLayoutRoute,
  path: '/initiate',
  component: InitiationView,
});
