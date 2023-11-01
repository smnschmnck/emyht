import { Link } from "@tanstack/react-router";
import { FC } from "react";

export const LoginPage: FC = () => {
  return (
    <div>
      <h1>Log in pls</h1>
      <Link to="/sign-up">Sign Up</Link>
    </div>
  );
};
