import { createRoute } from '@tanstack/react-router';
import { indexLayoutRoute } from '../layout/route';
import { IncomingRequests } from './IncomingRequests';

export const incomingRequestsRoute = createRoute({
  getParentRoute: () => indexLayoutRoute,
  path: '/incoming-requests',
  component: IncomingRequests,
});
