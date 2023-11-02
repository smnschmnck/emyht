import { Route, redirect } from "@tanstack/react-router";
import { AuthLayout } from "./AuthLayout";
import { mainLayoutRoute } from "@/pages/_mainLayout/route";

export const authLayoutRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
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
