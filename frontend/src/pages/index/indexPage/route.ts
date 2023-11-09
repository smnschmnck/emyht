import { Route, redirect } from '@tanstack/react-router';
import { IndexPage } from './IndexPage';
import { indexLayoutRoute } from '../layout/route';
import { getChats } from '@/api/chats';

export const indexRoute = new Route({
  getParentRoute: () => indexLayoutRoute,
  path: '/',
  component: IndexPage,
  beforeLoad: async () => {
    const chats = await getChats();
    if (chats.length <= 0) {
      throw redirect({ to: '/initiate' });
    }
  },
});
