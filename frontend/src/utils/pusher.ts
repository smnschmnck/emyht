import { env } from '@/env';
import { useAuth0 } from '@auth0/auth0-react';
import Pusher from 'pusher-js';
import { createContext, useEffect, useRef, useState } from 'react';

export const PusherContext = createContext<{ pusher: Pusher | null }>({
  pusher: null,
});

export const usePusherInstance = () => {
  const { getAccessTokenSilently, isAuthenticated, isLoading } = useAuth0();
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const getTokenRef = useRef(getAccessTokenSilently);

  useEffect(() => {
    getTokenRef.current = getAccessTokenSilently;
  }, [getAccessTokenSilently]);

  useEffect(() => {
    // Don't create Pusher until auth is settled and user is authenticated
    if (isLoading || !isAuthenticated) {
      return;
    }

    const instance = new Pusher(env.VITE_PUSHER_KEY, {
      cluster: env.VITE_PUSHER_CLUSTER,
      authEndpoint: `${env.VITE_BACKEND_HOST}/pusher/auth`,
      authorizer: ({ name }) => ({
        authorize: async (socketId, callback) => {
          try {
            const token = await getTokenRef.current();
            const formData = new URLSearchParams();
            formData.append('socket_id', socketId);
            formData.append('channel_name', name);

            const res = await fetch(`${env.VITE_BACKEND_HOST}/pusher/auth`, {
              method: 'POST',
              body: formData,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Authorization: `Bearer ${token}`,
              },
            });

            if (!res.ok) {
              throw new Error(await res.text());
            }

            const json = (await res.json()) as {
              auth?: string;
              channel_data?: string;
            };
            if (!json.auth) {
              throw new Error('Could not authorize');
            }

            callback(null, { ...json, auth: json.auth });
          } catch (e) {
            if (e instanceof Error) {
              callback(e, null);
            } else {
              callback(new Error('Unknown error'), null);
            }
          }
        },
      }),
    });

    instance.connection.bind('connected', () => {
      console.debug('[Pusher] connected');
    });
    instance.connection.bind('error', (err: unknown) => {
      console.error('[Pusher] connection error', err);
    });

    setPusher(instance);

    return () => {
      instance.disconnect();
      setPusher(null);
    };
  }, [isAuthenticated, isLoading]);

  return pusher;
};
