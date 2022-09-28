import { BACKEND_HOST } from '../helpers/serverGlobals';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import ISingleChat from '../interfaces/ISingleChat';

export const getChats = async (cookies: NextApiRequestCookies) => {
  try {
    const res = await fetch(BACKEND_HOST + '/chats', {
      headers: {
        authorization: `Bearer ${cookies.SESSIONID}`,
      },
    });
    if (!res.ok) {
      return [];
    }
    const json = (await res.json()) as ISingleChat[];
    return json;
  } catch (err) {
    return [];
  }
};

export const getContactRequests = async (cookies: NextApiRequestCookies) => {
  try {
    const res = await fetch(BACKEND_HOST + '/pendingContactRequests', {
      headers: {
        authorization: `Bearer ${cookies.SESSIONID}`,
      },
    });
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    return json;
  } catch (err) {
    return [];
  }
};
