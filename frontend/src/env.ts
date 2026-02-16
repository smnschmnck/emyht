import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_BACKEND_HOST: z.string().url(),
    VITE_PUSHER_KEY: z.string().min(4),
    VITE_PUSHER_CLUSTER: z.string().min(1),
    VITE_AUTH0_DOMAIN: z.string().min(1),
    VITE_AUTH0_CLIENT_ID: z.string().min(1),
    VITE_AUTH0_AUDIENCE: z.string().url(),
  },
  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,

  skipValidation: import.meta.env?.CI === 'true',
});
