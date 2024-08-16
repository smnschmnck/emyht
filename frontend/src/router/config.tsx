import { routes } from '@/pages/allRoutes';
import { Outlet, createRootRoute, createRouter } from '@tanstack/react-router';

export const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren(routes);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
