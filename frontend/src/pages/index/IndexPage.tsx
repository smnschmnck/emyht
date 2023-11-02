import { queryKeys } from "@/configs/queryKeys";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import { FC, useEffect } from "react";

export const IndexPage: FC = () => {
  const navigate = useNavigate();
  const { isLoading, error: userDataError } = useQuery({
    ...queryKeys.users.details,
    retry: false,
  });

  useEffect(() => {
    if (userDataError) {
      navigate({ to: "/sign-in" });
    }
  }, [userDataError, navigate]);

  if (isLoading) {
    return <></>;
  }

  return (
    <div>
      <h1>Hello there :D</h1>
      <Link to="/sign-in">Log in</Link>
    </div>
  );
};
