import { mainLayoutRoute } from './_mainLayout/route';
import { authRoutes } from './auth/authRoutes';
import { indexRoutes } from './index/indexRoutes';
import { noEmailRoute } from './noEmail/route';
import { verifyEmailRoute } from './verifyEmail/route';

export const routes = [
  ...indexRoutes,
  mainLayoutRoute,
  noEmailRoute,
  verifyEmailRoute,
  ...authRoutes,
];
