import { rootRoute } from "@/router/config";
import { Route } from "@tanstack/react-router";
import { AuthLayout } from "./AuthLayout";

export const authLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  id: "authLayoutRoute",
  component: AuthLayout,
});
