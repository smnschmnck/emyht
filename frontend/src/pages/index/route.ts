import { rootRoute } from "@/router/config";
import { Route } from "@tanstack/react-router";
import { IndexPage } from "./IndexPage";

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
});
