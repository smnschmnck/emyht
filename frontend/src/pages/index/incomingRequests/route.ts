import { Route } from '@tanstack/react-router';
import { indexLayoutRoute } from '../layout/route';
import { IncomingRequests } from './IncomingRequests';

export const incomingRequestsRoute = new Route({
  getParentRoute: () => indexLayoutRoute,
  path: '/incoming-requests',
  component: IncomingRequests,
});
