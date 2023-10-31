import { Outlet, RootRoute, Router } from "@tanstack/react-router";
import { loginRoute } from "../pages/login/route";
import { signUpRoute } from "../pages/signUp/route";
import { indexRoute } from "../pages/index/route";

export const rootRoute = new RootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren([indexRoute, loginRoute, signUpRoute]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
