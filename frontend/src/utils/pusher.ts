import { env } from '@/env';
import Pusher from 'pusher-js';
import { createContext } from 'react';
import { fetchWithDefaults } from './fetch';

const getPusherToken = async ({
  socketId,
  name,
}: {
  socketId: string;
  name: string;
}) => {
  const formData = new URLSearchParams();
  formData.append('socket_id', socketId);
  formData.append('channel_name', name);

  const res = await fetchWithDefaults('/pusher/auth', {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
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

  return auth;
};

export const pusher = new Pusher(env.VITE_PUSHER_KEY, {
  cluster: env.VITE_PUSHER_CLUSTER,
  authEndpoint: `${env.VITE_BACKEND_HOST}/pusher/auth`,
  authorizer: ({ name }) => ({
    authorize: async (socketId, callback) => {
      try {
        const channelToken = await getPusherToken({ socketId, name });
        callback(null, { auth: channelToken });
      } catch (e) {
        console.log('e', e);
        if (e instanceof Error) {
          callback(e, null);
        } else {
          callback(new Error('Unknown error'), null);
        }
      }
    },
  }),
});

export const PusherContext = createContext({
  pusher,
});
