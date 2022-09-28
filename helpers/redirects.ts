import { GetServerSidePropsContext } from 'next';

export const redirectToNoEmail = (context: GetServerSidePropsContext) => {
  const res = context.res;
  res.writeHead(302, { Location: '/noEmail' });
  res.end();
};

export const redirectToLogin = (context: GetServerSidePropsContext) => {
  const res = context.res;
  res.writeHead(302, { Location: '/login' });
  res.end();
};
