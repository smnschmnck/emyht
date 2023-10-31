import { Outlet, RootRoute, Route, Router } from "@tanstack/react-router";

const rootRoute = new RootRoute({
  component: () => <Outlet />,
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <h1>Hello there :D</h1>,
});

const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: () => <h1>Login pls</h1>,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
