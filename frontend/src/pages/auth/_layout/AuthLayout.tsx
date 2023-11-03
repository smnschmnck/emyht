import illustration from "./assets/illustration.svg";
import { Outlet, useRouteContext } from "@tanstack/react-router";
import { authLayoutRoute } from "./route";

export const AuthLayout = () => {
  const routeContext = useRouteContext({ from: authLayoutRoute.id });

  if (routeContext.hasError) {
    return <p>{routeContext.errorMessage}</p>;
  }

  return (
    <div className="flex h-full items-center">
      <div className="md:flex min-w-[420px] justify-center items-center w-full hidden">
        <img className="w-2/3" src={illustration} alt="illustration of user" />
      </div>
      <div className="flex justify-center items-center w-full">
        <Outlet />
      </div>
    </div>
  );
};
