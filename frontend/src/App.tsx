import { env } from '@/env';
import { router } from '@/router/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import { createContext, useEffect, useState } from 'react';
import { Toaster } from 'sonner';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
    },
  },
});

export const WebSocketContext = createContext<{
  webSocket: WebSocket | null;
  isAuthenticated: boolean;
  setIsAuthenticated: ((isAuthenticated: boolean) => void) | null;
}>({
  webSocket: null,
  isAuthenticated: false,
  setIsAuthenticated: null,
});

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [webSocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(env.VITE_WEBSOCKET_HOST);
    setWebSocket(ws);

    ws.onopen = () => {
      ws.send('LOL');
    };
  }, []);

  return (
    <WebSocketContext.Provider
      value={{
        webSocket: webSocket,
        isAuthenticated: isAuthenticated,
        setIsAuthenticated: setIsAuthenticated,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" />
        <RouterProvider router={router} />
      </QueryClientProvider>
    </WebSocketContext.Provider>
  );
};

export default App;
