import emyhtLogo from "@assets/images/emyht-logo.svg";
import { Outlet } from "@tanstack/react-router";

export const AuthLayout = () => {
  return (
    <div className="px-12 py-8">
      <img src={emyhtLogo} alt="emyht" />
      <Outlet />
    </div>
  );
};
