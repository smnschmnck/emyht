import {
  useMatchRoute,
  useRouter,
  useRouterState,
} from '@tanstack/react-router';

const CHAT_SUBROUTE = '/chat/';

export const useIsSidebarHidden = () => {
  const { routesByPath } = useRouter();
  const { location } = useRouterState();

  const hideRoutes = [
    routesByPath['/initiate'].fullPath,
    routesByPath['/incoming-requests'].fullPath,
    CHAT_SUBROUTE,
  ];

  const idx = hideRoutes.findIndex((r) => location.pathname.startsWith(r));

  return idx !== -1;
};

export const useChatId = () => {
  const matchRoute = useMatchRoute();
  const chatRoute = matchRoute({ to: '/chat/$chatId' });
  if (!chatRoute) {
    return;
  }

  return chatRoute.chatId;
};
