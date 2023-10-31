import { Route } from "@tanstack/react-router";
import { rootRoute } from "../../router/config";
import { SignUpPage } from "./SignUpPage";

export const signUpRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/sign-up",
  component: SignUpPage,
});
