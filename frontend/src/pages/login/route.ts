import { Route } from "@tanstack/react-router";
import { LoginPage } from "./LoginPage";
import { authLayoutRoute } from "@/layouts/authLayout";

export const loginRoute = new Route({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: LoginPage,
});
