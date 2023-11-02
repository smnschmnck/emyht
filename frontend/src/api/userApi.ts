import { env } from "@/env";

export const getUserData = async () => {
  const res = await fetch(`${env.VITE_BACKEND_HOST}/user`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }

  return (await res.json()) as {
    uuid: string;
    email: string;
    username: string;
    isAdmin: boolean;
    emailActive: boolean;
    profilePictureUrl: string;
  };
};
