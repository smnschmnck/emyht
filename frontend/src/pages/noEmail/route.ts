import { rootRoute } from '@/router/config';
import { createRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { NoEmailPage } from './NoEmailPage';

const noEmailSearchSchema = z.object({
  email: z.string().optional(),
});

export const noEmailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/no-email',
  validateSearch: noEmailSearchSchema,
  component: NoEmailPage,
});
