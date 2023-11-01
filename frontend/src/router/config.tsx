import { routes } from "@/pages/allRoutes";
import { Outlet, RootRoute, Router } from "@tanstack/react-router";

export const rootRoute = new RootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren(routes);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
