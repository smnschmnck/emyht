import { env } from '@/env';

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export const fetchWithDefaults = (
  endpoint: string,
  options: FetchOptions = {}
) => {
  const url = `${env.VITE_BACKEND_HOST}${endpoint}`;

  const defaultOptions: FetchOptions = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const mergedOptions: FetchOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  return fetch(url, mergedOptions);
};
