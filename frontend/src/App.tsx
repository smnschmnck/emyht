import { router } from '@/router/config';
import { Auth0Provider } from '@auth0/auth0-react';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { RouterProvider } from '@tanstack/react-router';
import { FC } from 'react';
import { Toaster } from 'sonner';
import { env } from './env';
import { PusherContext, usePusherInstance } from './utils/pusher';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
    },
  },
});

const persister = createSyncStoragePersister({
  storage: window.localStorage,
});

const AppInner: FC = () => {
  const pusher = usePusherInstance();

  return (
    <PusherContext.Provider value={{ pusher }}>
      <PersistQueryClientProvider
        persistOptions={{ persister }}
        client={queryClient}
      >
        <Toaster richColors closeButton position="top-right" />
        <RouterProvider router={router} />
      </PersistQueryClientProvider>
    </PusherContext.Provider>
  );
};

const App = () => {
  return (
    <Auth0Provider
      domain={env.VITE_AUTH0_DOMAIN}
      clientId={env.VITE_AUTH0_CLIENT_ID}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: env.VITE_AUTH0_AUDIENCE,
      }}
    >
      <AppInner />
    </Auth0Provider>
  );
};

export default App;
