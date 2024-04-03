import { createRoute } from '@tanstack/react-router';
import { authLayoutRoute } from '../layout/route';
import { SignInPage } from './SignInPage';

export const signInRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/sign-in',
  component: SignInPage,
});
