import { Route } from "@tanstack/react-router";
import { mainLayoutRoute } from "../_mainLayout/route";
import { VerifyEmailPage } from "./VerifyEmailPage";
import { z } from "zod";

const searchParamSchema = z.object({
  token: z.string().uuid(),
});

export type SearchParamSchema = z.infer<typeof searchParamSchema>;

export const verifyEmailRoute = new Route({
  getParentRoute: () => mainLayoutRoute,
  validateSearch: searchParamSchema,
  path: "/verify-email",
  component: VerifyEmailPage,
});
