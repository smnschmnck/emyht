import { authRoutes } from './auth/authRoutes';
import { indexRoutes } from './index/indexRoutes';
import { mainLayoutRoute } from './mainLayout/route';
import { noEmailRoute } from './noEmail/route';
import { verifyEmailRoute } from './verifyEmail/route';

export const routes = [
  mainLayoutRoute,
  noEmailRoute,
  verifyEmailRoute,
  ...authRoutes,
  ...indexRoutes,
];
