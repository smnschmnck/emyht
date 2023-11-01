import { Link } from "@tanstack/react-router";
import { FC } from "react";

export const SignUpPage: FC = () => {
  return (
    <div className="flex flex-col justify-center items-center">
      <h1 className="text-5xl font-medium">Sign up</h1>
      <Link to="/sign-in">Sign in</Link>
    </div>
  );
};
