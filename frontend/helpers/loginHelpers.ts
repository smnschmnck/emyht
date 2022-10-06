import { BACKEND_HOST } from './serverGlobals';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import IUser from '../interfaces/IUser';

export interface GetUserResponse extends IUser {
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

  return json;
};
