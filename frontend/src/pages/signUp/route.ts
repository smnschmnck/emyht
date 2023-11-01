import { Route } from "@tanstack/react-router";
import { SignUpPage } from "./SignUpPage";
import { rootRoute } from "@/router/config";

export const signUpRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/sign-up",
  component: SignUpPage,
});
