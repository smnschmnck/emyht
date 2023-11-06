import { Route } from '@tanstack/react-router';
import { indexLayoutRoute } from '../_layout/route';
import { ChatView } from './ChatView';

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
