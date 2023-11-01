import { rootRoute } from "@/router/config";
import { Route, redirect } from "@tanstack/react-router";
import { AuthLayout } from "./AuthLayout";

export const authLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  id: "authLayoutRoute",
  component: AuthLayout,
  beforeLoad: async () => {
    const isAuthed = false;
    if (isAuthed) {
      throw redirect({
        to: "/",
      });
    }
  },
});
