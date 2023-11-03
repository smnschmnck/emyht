import { mainLayoutRoute } from './_mainLayout/route';
import { authRoutes } from './auth/authRoutes';
import { indexRoute } from './index/route';
import { noEmailRoute } from './noEmail/route';
import { verifyEmailRoute } from './verifyEmail/route';

export const routes = [
  indexRoute,
  mainLayoutRoute,
  noEmailRoute,
  verifyEmailRoute,
  ...authRoutes,
];
