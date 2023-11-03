import { useUserData } from "@/hooks/api/users/useUserData";
import { useNavigate } from "@tanstack/react-router";
import { FC, useEffect } from "react";

export const IndexPage: FC = () => {
  const navigate = useNavigate();
  const { data: userData, error: userDataError } = useUserData();

  useEffect(() => {
    if (userDataError) {
      navigate({
        to: "/sign-in",
        replace: true,
      });
      return;
    }
    if (userData) {
      if (!userData.emailActive) {
        navigate({
          to: "/no-email",
          replace: true,
        });
        return;
      }
    }
  }, [userData, userDataError, navigate]);

  if (!userData) {
    return <></>;
  }

  return (
    <div>
      <h1>Hello {userData.username}</h1>
      <h1>Email Active: {String(userData.emailActive)}</h1>
    </div>
  );
};
