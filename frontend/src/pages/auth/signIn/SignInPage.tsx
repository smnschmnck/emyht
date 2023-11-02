import { getUserData } from "@/api/userApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Link } from "@/components/ui/Link";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { queryKeys } from "@/configs/queryKeys";
import { env } from "@/env";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { FC, FormEvent, useState } from "react";

export const SignInPage: FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (event: FormEvent) => {
    event.preventDefault();

    const res = await fetch(`${env.VITE_BACKEND_HOST}/login`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        authMethod: "cookie",
      }),
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await getUserData();
  };

  const loginMutation = useMutation({
    mutationKey: queryKeys.users.details.queryKey,
    mutationFn: login,
    onSuccess: ({ emailActive }) => {
      if (emailActive) {
        navigate({
          to: "/",
        });
      }
    },
  });

  return (
    <div className="flex gap-6 flex-col w-full max-w-sm">
      <div>
        <h1 className="text-3xl font-medium">Welcome back</h1>
        <p className="text-sm text-zinc-500">
          Please sign in to start chatting
        </p>
      </div>
      <div className="flex gap-2 flex-col items-center">
        <form
          className="flex gap-2 flex-col w-full"
          onSubmit={loginMutation.mutate}
        >
          <Input
            placeholder="E-Mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <PasswordInput
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit">Sign in</Button>
        </form>
        <div className="flex gap-2">
          <p className="text-sm text-zinc-500">No account?</p>
          <Link to="/sign-up">Sign up</Link>
        </div>
      </div>
    </div>
  );
};
