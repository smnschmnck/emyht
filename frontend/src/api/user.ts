import { HttpError } from '@/errors/httpError/httpError';
import { fetchWithDefaults } from '@/utils/fetch';

export type UserData = {
  uuid: string;
  email: string;
  username: string;
  isAdmin: boolean;
  emailActive: boolean;
  profilePictureUrl: string;
};

export const getUserData = async () => {
  const res = await fetchWithDefaults('/user');
  if (!res.ok) {
    throw new HttpError({
      message: await res.text(),
      statusCode: res.status,
    });
  }

  return (await res.json()) as UserData;
};
