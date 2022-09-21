import type {
  GetServerSideProps,
  GetServerSidePropsContext,
  NextPage,
} from 'next';
import { ContactRequest } from '../components/Chats';
import { getLoginData } from '../helpers/loginHelpers';
import { ServerResponse } from 'http';
import ISingleChat from '../interfaces/ISingleChat';
import { BACKEND_HOST } from '../helpers/serverGlobals';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';

import IUser from '../interfaces/IUser';
import { Main } from '../components/Main';

interface IndexPageProps {
  user: IUser;
  isAdmin: boolean;
  chats: ISingleChat[];
  firstChatID?: string;
  contactRequests: ContactRequest[];
}

const redirectOnUnverifiedEmail = (res: ServerResponse) => {
  res.writeHead(302, { Location: '/noEmail' });
  res.end();
};

const redirectOnLoggedOut = (res: ServerResponse) => {
  res.writeHead(302, { Location: '/login' });
  res.end();
};

const getContactRequests = async (cookies: NextApiRequestCookies) => {
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

const getChats = async (cookies: NextApiRequestCookies) => {
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

const emptyProps = {
  props: {},
};

export const getServerSideProps: GetServerSideProps<
  IndexPageProps | {}
> = async (context: GetServerSidePropsContext) => {
  const cookies = context.req.cookies;
  try {
    getContactRequests(cookies);
    const getUserResponse = await getLoginData(cookies);
    const user: IUser = {
      uuid: getUserResponse.uuid,
      username: getUserResponse.username,
      email: getUserResponse.email,
    };
    if (!getUserResponse.emailActive) {
      redirectOnUnverifiedEmail(context.res);
      return emptyProps;
    }
    const chats = await getChats(cookies);
    const firstChatID = chats[0]?.chatID ?? null;
    return {
      props: {
        user: user,
        chats: chats,
        firstChatID: firstChatID,
        contactRequests: await getContactRequests(cookies),
      },
    };
  } catch {
    redirectOnLoggedOut(context.res);
    return emptyProps;
  }
};

const HomePage: NextPage<IndexPageProps> = ({
  user,
  chats,
  firstChatID,
  contactRequests,
}) => {
  return (
    <Main
      user={user}
      chats={chats}
      contactRequests={contactRequests}
      firstChatID={firstChatID}
    />
  );
};

export default HomePage;
