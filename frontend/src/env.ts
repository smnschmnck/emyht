import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
  clientPrefix: 'VITE_',

  client: {
    VITE_BACKEND_HOST: z.string().url(),
    VITE_WEBSOCKET_HOST: z.string().min(1),
  },
  runtimeEnv: import.meta.env,

  emptyStringAsUndefined: true,
});
