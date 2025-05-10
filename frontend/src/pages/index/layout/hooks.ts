import { useMatchRoute } from '@tanstack/react-router';

export const useIsSidebarHidden = () => {
  const matchRoute = useMatchRoute();

  const hideRoutes = [
    matchRoute({ to: '/chat/$chatId' }),
    matchRoute({ to: '/initiate' }),
    matchRoute({ to: '/incoming-requests' }),
    matchRoute({ to: '/chat/$chatId/settings' }),
  ];

  return hideRoutes.some((isRouteMatch) => Boolean(isRouteMatch));
};

export const useChatId = () => {
  const matchRoute = useMatchRoute();

  const chatRoute = matchRoute({ to: '/chat/$chatId' });

  if (chatRoute) {
    return chatRoute.chatId;
  }
};
