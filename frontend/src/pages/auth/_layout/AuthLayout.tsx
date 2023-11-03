import illustration from "./assets/illustration.svg";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useUserData } from "@/hooks/api/users/useUserData";

export const AuthLayout = () => {
  const { data: userData, isLoading } = useUserData();
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      if (userData.emailActive) {
        navigate({
          to: "/",
          replace: true,
        });
        return;
      }
      if (!userData.emailActive) {
        navigate({
          to: "/no-email",
          replace: true,
        });
        return;
      }
    }
  }, [userData, navigate]);

  if (isLoading) {
    return <></>;
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
