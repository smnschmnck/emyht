import { Route } from '@tanstack/react-router';
import { VerifyEmailPage } from './VerifyEmailPage';
import { z } from 'zod';
import { mainLayoutRoute } from '../mainLayout/route';

const searchParamSchema = z.object({
  token: z.string().uuid(),
});

export type SearchParamSchema = z.infer<typeof searchParamSchema>;

export const verifyEmailRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  validateSearch: searchParamSchema,
  path: '/verify-email',
  component: VerifyEmailPage,
});
