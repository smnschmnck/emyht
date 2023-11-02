import illustration from "./assets/illustration.svg";
import { Outlet, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/configs/queryKeys";
import { useEffect } from "react";

export const AuthLayout = () => {
  const { data: userData, isLoading } = useQuery({
    ...queryKeys.users.details,
    retry: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (userData) {
      if (userData.emailActive) {
        navigate({ to: "/" });
        return;
      }
      if (!userData.emailActive) {
        navigate({ to: "/no-email" });
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
