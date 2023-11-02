import { Route } from "@tanstack/react-router";
import { SignUpPage } from "./SignUpPage";
import { authLayoutRoute } from "../_layout/route";

export const signUpRoute = new Route({
  getParentRoute: () => authLayoutRoute,
  path: "/sign-up",
  component: SignUpPage,
});
