import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Link } from "@tanstack/react-router";
import { FC } from "react";

export const SignUpPage: FC = () => {
  return (
    <div className="flex gap-6 flex-col w-80">
      <div>
        <h1 className="text-3xl font-medium">Create account</h1>
        <p className="text-sm text-zinc-500">Please enter your details</p>
      </div>
      <div className="flex gap-2 flex-col items-center">
        <form className="flex gap-2 flex-col w-full">
          <Input placeholder="Username" />
          <Input placeholder="E-Mail" />
          <PasswordInput placeholder="Password" />
          <PasswordInput placeholder="Repeat password" />
          <Button>Sign up</Button>
        </form>
        <div className="flex gap-2">
          <p className="text-sm text-zinc-500">Already got an account?</p>
          <Link className="text-sm text-blue-600 hover:underline" to="/sign-in">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
