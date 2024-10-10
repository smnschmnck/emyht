import { router } from '@/router/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import Pusher from 'pusher-js';
import { createContext, useContext } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

const pusher = new Pusher('fee65361c492db024af1', {
  cluster: 'us3',
});

const PusherContext = createContext({
  pusher,
});

export const usePusher = () => {
  return useContext(PusherContext);
};

const App = () => {
  return (
    <PusherContext.Provider value={{ pusher }}>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </PusherContext.Provider>
  );
};

export default App;
