import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { mainLayoutRoute } from '../mainLayout/route';
import { VerifyEmailPage } from './VerifyEmailPage';

const searchParamSchema = z.object({
  token: z.string(),
});

export type SearchParamSchema = z.infer<typeof searchParamSchema>;

export const verifyEmailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  validateSearch: searchParamSchema,
  path: '/verify-email',
  component: VerifyEmailPage,
});
