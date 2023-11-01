import { Link } from "@tanstack/react-router";
import { FC } from "react";

export const IndexPage: FC = () => {
  return (
    <div>
      <h1>Hello there :D</h1>
      <Link to="/sign-in">Log in</Link>
    </div>
  );
};
