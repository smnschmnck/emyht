import { rootRoute } from "@/router/config";
import { Route, redirect } from "@tanstack/react-router";
import { IndexPage } from "./IndexPage";

export const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: IndexPage,
  beforeLoad: async () => {
    const isAuthed = false;
    if (!isAuthed) {
      throw redirect({
        to: "/login",
      });
    }
  },
});
