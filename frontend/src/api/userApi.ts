import { env } from "@/env";
import { HttpError } from "@/errors/types/httpError";

export const getUserData = async () => {
  const res = await fetch(`${env.VITE_BACKEND_HOST}/user`, {
    credentials: "include",
  });
  if (!res.ok) {
    throw new HttpError({
      message: await res.text(),
      statusCode: res.status,
    });
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
