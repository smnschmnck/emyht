import { Outlet, Route } from "@tanstack/react-router";
import emyhtLogo from "@assets/images/emyht-logo.svg";
import { rootRoute } from "@/router/config";

export const authLayoutRoute = new Route({
  getParentRoute: () => rootRoute,
  id: "authLayoutRoute",
  component: () => (
    <div className="px-12 py-8">
      <img src={emyhtLogo} alt="emyht" />
      <Outlet />
    </div>
  ),
});
