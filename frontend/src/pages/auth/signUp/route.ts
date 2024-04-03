import { createRoute } from '@tanstack/react-router';
import { authLayoutRoute } from '../layout/route';
import { SignUpPage } from './SignUpPage';

export const signUpRoute = createRoute({
  getParentRoute: () => authLayoutRoute,
  path: '/sign-up',
  component: SignUpPage,
});
