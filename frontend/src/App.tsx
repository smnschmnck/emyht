import { RouterProvider } from '@tanstack/react-router';
import { router } from '@/router/config';
import { Toaster } from 'sonner';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Toaster richColors />
    <RouterProvider router={router} />
  </QueryClientProvider>
);

export default App;
