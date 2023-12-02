import { useRouter, useRouterState } from '@tanstack/react-router';

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
  const { location } = useRouterState();
  const currentPath = location.pathname;

  if (!currentPath.startsWith(CHAT_SUBROUTE)) {
    return;
  }

  const chatId = currentPath.split(CHAT_SUBROUTE).at(1);
  return chatId;
};
