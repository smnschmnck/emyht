import { authRoutes } from "./_auth/authRoutes";
import { indexRoute } from "./index/route";

export const routes = [indexRoute, ...authRoutes];
