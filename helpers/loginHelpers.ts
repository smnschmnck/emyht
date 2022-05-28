import { BACKEND_HOST } from './globals';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

interface GetUserResponse {
  sessionID: string;
  username: string;
  email: string;
  isAdmin: boolean;
  emailActive: boolean;
}

export const getLoginData = async (cookies: NextApiRequestCookies) => {
  const sessionID = cookies.SESSIONID;

  if (!sessionID) {
    throw new Error('Not logged in');
  }

  const resp = await fetch(`${BACKEND_HOST}/user`, {
    headers: { authorization: `Bearer ${sessionID}` },
  });

  if (!resp.ok) {
    throw new Error('Not logged in');
  }

  const json: GetUserResponse = await resp.json();

  console.log(json);
  return json;
};
