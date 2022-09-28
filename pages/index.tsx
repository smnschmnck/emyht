import type { GetServerSidePropsContext, NextPage } from 'next';
import { ChatSPA } from '../components/ChatSPA';
import { dehydrate, QueryClient } from '@tanstack/react-query';
import { getLoginData } from '../helpers/loginHelpers';
import { redirectToLogin, redirectToNoEmail } from '../helpers/redirects';
import { getChats, getContactRequests } from '../helpers/initialChatProps';

const getQueryProps = (queryClient: QueryClient) => {
  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
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
      return null;
    }
  });

  if (!userData) {
    redirectToLogin(context);
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
