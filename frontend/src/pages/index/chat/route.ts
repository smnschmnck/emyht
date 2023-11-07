import { Route } from '@tanstack/react-router';
import { ChatView } from './ChatView';
import { indexLayoutRoute } from '../layout/route';

export const chatRoute = new Route({
  getParentRoute: () => indexLayoutRoute,
  path: '/chat/$chatId',
  component: ChatView,
  loaderContext: (ctx) => ctx,
  loader: (ctx) => {
    return {
      chatId: ctx.params.chatId,
    };
  },
});
