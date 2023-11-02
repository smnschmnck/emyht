import { Outlet } from "@tanstack/react-router";
import emyhtLogo from "@assets/images/emyht-logo.svg";
import { FC } from "react";

export const MainLayout: FC = () => (
  <div className="flex h-screen flex-col px-12 py-8">
    <img className="w-24" src={emyhtLogo} alt="emyht" />
    <Outlet />
  </div>
);