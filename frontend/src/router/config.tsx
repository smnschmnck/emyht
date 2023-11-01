import { Outlet, RootRoute, Router } from "@tanstack/react-router";
import { authLayoutRoute } from "@/layouts/authLayout";
import { loginRoute } from "@/pages/login/route";
import { indexRoute } from "@/pages/index/route";
import { signUpRoute } from "@/pages/signUp/route";

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
