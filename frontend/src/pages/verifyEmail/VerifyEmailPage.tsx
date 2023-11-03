import { useNavigate, useSearch } from "@tanstack/react-router";
import { FC, useEffect } from "react";
import { verifyEmailRoute } from "./route";
import { useQuery } from "@tanstack/react-query";
import { env } from "@/env";
import { useUserData } from "@/hooks/api/users/useUserData";

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate();
  const { token } = useSearch({ from: verifyEmailRoute.id });
  const userDataQuery = useUserData();

  const verifyEmail = async () => {
    const res = await fetch(`${env.VITE_BACKEND_HOST}/verifyEmail`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        emailToken: token,
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    await userDataQuery.refetch();

    return res.text();
  };

  const verifyEmailQuery = useQuery({
    queryKey: ["ve"],
    queryFn: verifyEmail,
  });

  useEffect(() => {
    if (userDataQuery.data) {
      if (userDataQuery.data.emailActive) {
        navigate({
          to: "/",
          replace: true,
        });
        return;
      }
    }
  }, [navigate, userDataQuery.data, userDataQuery.data?.emailActive]);

  if (userDataQuery.isLoading) {
    return <></>;
  }

  if (verifyEmailQuery.isLoading) {
    return <>verifying...</>;
  }

  if (verifyEmailQuery.isError) {
    return <>{verifyEmailQuery.error.message}</>;
  }

  return <>ok</>;
};
