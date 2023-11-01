import { Route } from "@tanstack/react-router";
import { LoginPage } from "./LoginPage";
import { authLayoutRoute } from "../_layout/route";

export const loginRoute = new Route({
  getParentRoute: () => authLayoutRoute,
  path: "/login",
  component: LoginPage,
});
