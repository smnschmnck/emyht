import type { GetServerSidePropsContext, NextPage } from 'next';
import { ChatSPA } from '../components/ChatSPA';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { getLoginData } from '../helpers/loginHelpers';
import { BACKEND_HOST } from '../helpers/serverGlobals';
import { NextApiRequestCookies } from 'next/dist/server/api-utils';
import ISingleChat from '../interfaces/ISingleChat';

const redirectToNoEmail = (context: GetServerSidePropsContext) => {
  const res = context.res;
  res.writeHead(302, { Location: '/noEmail' });
  res.end();
};

const redirectToLogin = (context: GetServerSidePropsContext) => {
  const res = context.res;
  res.writeHead(302, { Location: '/login' });
  res.end();
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

const getQueryProps = (queryClient: QueryClient) => {
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
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

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const queryClient = new QueryClient();

  const cookies = context.req.cookies;
  if (!cookies.SESSIONID) {
    redirectToLogin(context);
    return getQueryProps(queryClient);
  }

  const userData = await queryClient.fetchQuery(['user'], async () => {
    try {
      return await getLoginData(context.req.cookies);
    } catch (err) {
      redirectToLogin(context);
      return null;
    }
  });

  if (!userData) {
    return getQueryProps(queryClient);
  }

  if (!userData.emailActive) {
    redirectToNoEmail(context);
    return getQueryProps(queryClient);
  }

  await queryClient.prefetchQuery(['chats'], async () => {
    return await getChats(context.req.cookies);
  });

  await queryClient.prefetchQuery(['contactRequests'], async () => {
    return await getContactRequests(context.req.cookies);
  });

  return getQueryProps(queryClient);
};

const HomePage: NextPage = () => {
  return <ChatSPA />;
};

export default HomePage;
