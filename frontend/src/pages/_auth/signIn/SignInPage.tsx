import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Link } from "@tanstack/react-router";
import { FC } from "react";

export const SignInPage: FC = () => {
  return (
    <div className="flex gap-6 flex-col w-80">
      <div>
        <h1 className="text-3xl font-medium">Welcome back</h1>
        <p className="text-sm text-zinc-500">
          Please sign in to start chatting
        </p>
      </div>
      <div className="flex gap-2 flex-col items-center">
        <form className="flex gap-2 flex-col w-full">
          <Input placeholder="E-Mail" />
          <PasswordInput placeholder="Password" />
          <Button>Sign in</Button>
        </form>
        <div className="flex gap-2">
          <p className="text-sm text-zinc-500">No account?</p>
          <Link className="text-sm text-blue-600 hover:underline" to="/sign-up">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};
