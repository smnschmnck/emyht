import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { mainLayoutRoute } from '../mainLayout/route';
import { VerifyEmailPage } from './VerifyEmailPage';

const searchParamSchema = z.object({
  token: z.string(),
});

export const verifyEmailRoute = createRoute({
  getParentRoute: () => mainLayoutRoute,
  validateSearch: (search) => searchParamSchema.parse(search),
  path: '/verify-email',
  component: VerifyEmailPage,
});
