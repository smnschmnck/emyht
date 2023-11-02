import { authRoutes } from "./_auth/authRoutes";
import { mainLayoutRoute } from "./_mainLayout/route";
import { indexRoute } from "./index/route";

export const routes = [indexRoute, mainLayoutRoute, ...authRoutes];
