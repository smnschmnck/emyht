import { router } from '@/router/config';
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { pusher, PusherContext } from './utils/pusher';

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

const App = () => {
  return (
    <PusherContext.Provider value={{ pusher }}>
      <PersistQueryClientProvider
        persistOptions={{ persister }}
        client={queryClient}
      >
        <Toaster richColors position="top-right" />
        <pre>{JSON.stringify(import.meta.env, null, 2)}</pre>
        <RouterProvider router={router} />
      </PersistQueryClientProvider>
    </PusherContext.Provider>
  );
};

export default App;
