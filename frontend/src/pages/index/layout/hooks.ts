import { useMatchRoute } from '@tanstack/react-router';

export const useIsSidebarHidden = () => {
  const matchRoute = useMatchRoute();

  const hideRoutes = [
    matchRoute({ to: '/chat/$chatId' }),
    matchRoute({ to: '/initiate' }),
    matchRoute({ to: '/incoming-requests' }),
  ];

  return hideRoutes.some((isRouteMatch) => Boolean(isRouteMatch));
};
