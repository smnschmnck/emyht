import { createRoute } from '@tanstack/react-router';
import { indexLayoutRoute } from '../layout/route';
import { InitiationView } from './Initiate';

export const initiateRoute = createRoute({
  getParentRoute: () => indexLayoutRoute,
  path: '/initiate',
  component: InitiationView,
});
