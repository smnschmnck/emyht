import { authLayoutRoute } from "@/pages/_auth/_layout/route";
import { loginRoute } from "@/pages/_auth/login/route";
import { signUpRoute } from "@/pages/_auth/signUp/route";
import { indexRoute } from "@/pages/index/route";
import { Outlet, RootRoute, Router } from "@tanstack/react-router";

export const rootRoute = new RootRoute({
  component: () => <Outlet />,
});

const routeTree = rootRoute.addChildren([
  authLayoutRoute,
  indexRoute,
  loginRoute,
  signUpRoute,
]);

export const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
