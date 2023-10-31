import { Route } from "@tanstack/react-router";
import { rootRoute } from "../../router/config";
import { LoginPage } from "./LoginPage";

export const loginRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});
