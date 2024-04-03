import { routes } from '@/pages/allRoutes';
import {
  LinkOptions,
  Outlet,
  RegisteredRouter,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router';

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

type TRouteTree = RegisteredRouter['routeTree'];

export type TLinkProps<TLinkOptions extends string = '.'> = LinkOptions<
  TRouteTree,
  '/',
  TLinkOptions
>;
