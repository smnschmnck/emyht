import emyhtLogo from "@assets/images/emyht-logo.svg";
import illustration from "./assets/illustration.svg";
import { Outlet } from "@tanstack/react-router";

export const AuthLayout = () => {
  return (
    <div className="flex h-screen flex-col px-12 py-8">
      <img className="w-24" src={emyhtLogo} alt="emyht" />
      <div className="flex h-full items-center">
        <div className="flex justify-center items-center w-full">
          <img
            className="w-2/3"
            src={illustration}
            alt="illustration of user"
          />
        </div>
        <div className="flex justify-center items-center w-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
