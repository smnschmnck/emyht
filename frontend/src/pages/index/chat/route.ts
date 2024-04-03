import { createRoute } from '@tanstack/react-router';
import { indexLayoutRoute } from '../layout/route';
import { ChatView } from './ChatView';

export const chatRoute = createRoute({
  getParentRoute: () => indexLayoutRoute,
  path: '/chat/$chatId',
  component: ChatView,
  loader: (ctx) => {
    return {
      chatId: ctx.params.chatId,
    };
  },
});
