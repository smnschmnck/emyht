import { env } from '@/env';
import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';

type FetchOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

export const useAuthFetch = () => {
  const { getAccessTokenSilently } = useAuth0();

  return useCallback(
    async (endpoint: string, options: FetchOptions = {}) => {
      const token = await getAccessTokenSilently();
      const url = `${env.VITE_BACKEND_HOST}${endpoint}`;

      const defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      const mergedOptions: FetchOptions = {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      };

      return fetch(url, mergedOptions);
    },
    [getAccessTokenSilently]
  );
};
