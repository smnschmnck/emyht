import { chatRoutes } from './chat/chatRoutes';
import { incomingRequestsRoute } from './incomingRequests/route';
import { indexRoute } from './indexPage/route';
import { initiateRoute } from './initiate/route';
import { indexLayoutRoute } from './layout/route';

export const indexRoutes = [
  indexLayoutRoute,
  indexRoute,
  ...chatRoutes,
  initiateRoute,
  incomingRequestsRoute,
];
