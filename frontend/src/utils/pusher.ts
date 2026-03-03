import { env } from '@/env';
import { useAuth0 } from '@auth0/auth0-react';
import Pusher from 'pusher-js';
import { createContext, useEffect, useMemo } from 'react';

export const PusherContext = createContext<{ pusher: Pusher | null }>({
  pusher: null,
});

export const usePusherInstance = () => {
  const { getAccessTokenSilently } = useAuth0();

  const pusher = useMemo(() => {
    return new Pusher(env.VITE_PUSHER_KEY, {
      cluster: env.VITE_PUSHER_CLUSTER,
      authEndpoint: `${env.VITE_BACKEND_HOST}/pusher/auth`,
      authorizer: ({ name }) => ({
        authorize: async (socketId, callback) => {
          try {
            const token = await getAccessTokenSilently();
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

            const json = (await res.json()) as { auth?: string };
            const { auth } = json;

            if (!auth) {
              throw new Error('Could not authorize');
            }

            callback(null, { auth });
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
  }, [getAccessTokenSilently]);

  useEffect(() => {
    return () => {
      pusher.disconnect();
    };
  }, [pusher]);

  return pusher;
};
