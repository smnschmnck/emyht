import { router } from '@/router/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { pusher, PusherContext } from './utils/pusher';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

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
