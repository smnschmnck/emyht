import { useNavigate, useSearch } from "@tanstack/react-router";
import { FC, useEffect } from "react";
import { verifyEmailRoute } from "./route";
import { useQuery } from "@tanstack/react-query";
import { env } from "@/env";
import { queryKeys } from "@/configs/queryKeys";

export const VerifyEmailPage: FC = () => {
  const navigate = useNavigate();
  const { token } = useSearch({ from: verifyEmailRoute.id });
  const userDataQuery = useQuery({ ...queryKeys.users.details, retry: false });

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
    navigate({ to: "/" });

    return res.text();
  };

  const verifyEmailQuery = useQuery({
    queryKey: ["ve"],
    queryFn: verifyEmail,
  });

  useEffect(() => {
    if (userDataQuery.data) {
      if (userDataQuery.data.emailActive) {
        navigate({ to: "/" });
        return;
      }
    }
  }, [navigate, userDataQuery.data]);

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
