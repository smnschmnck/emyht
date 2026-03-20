import { indexRoutes } from './index/indexRoutes';
import { noEmailRoute } from './noEmail/route';

export const routes = [
  ...indexRoutes,
  noEmailRoute,
];
