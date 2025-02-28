import { createRoute } from '@tanstack/react-router';
import { indexLayoutRoute } from '../../layout/route';
import { ChatSettingsView } from './ChatSettingsView';

export const chatSettingsRoute = createRoute({
  getParentRoute: () => indexLayoutRoute,
  path: '/chat/$chatId/settings',
  component: ChatSettingsView,
});
