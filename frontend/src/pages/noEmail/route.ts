import { Route } from "@tanstack/react-router";
import { NoEmailPage } from "./NoEmailPage";
import { mainLayoutRoute } from "../_mainLayout/route";

export const noEmailRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  path: "/no-email",
  component: NoEmailPage,
});
