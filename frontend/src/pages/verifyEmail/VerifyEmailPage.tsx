import { env } from "@/env";
import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { FC } from "react";
import { verifyEmailRoute } from "./route";

export const VerifyEmailPage: FC = () => {
  const { token } = useSearch({ from: verifyEmailRoute.id });

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

    return res.text();
  };

  const verifyEmailQuery = useQuery({
    queryKey: ["verifyEmail"],
    queryFn: verifyEmail,
  });

  if (verifyEmailQuery.isLoading) {
    return <>verifying...</>;
  }

  if (verifyEmailQuery.isError) {
    return <>{verifyEmailQuery.error.message}</>;
  }

  return <>ok</>;
};
