import { FC } from 'react';
import { NewChatDialog } from '@/pages/index/components/NewChatDialog';

export const NoChatsScreen: FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="max-w-sm text-center text-4xl font-semibold">
          You currently don't have any chats 🧐
        </h1>
        <NewChatDialog />
      </div>
    </div>
  );
};
