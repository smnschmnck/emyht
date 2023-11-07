import { Button } from '@/components/ui/Button';
import { FC } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';

const NewChatDialog = () => (
  <Dialog>
    <DialogTrigger className="w-full">
      <Button className="w-full">Start new chat</Button>
    </DialogTrigger>
    <DialogContent>
      <DialogTitle>New chat</DialogTitle>
      <div className="flex h-32 w-full items-center justify-center ">hey</div>
      <DialogClose className="flex w-full items-center justify-center">
        <p>Close</p>
      </DialogClose>
    </DialogContent>
  </Dialog>
);

export const NoChatsScreen: FC = () => {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-8">
        <h1 className="max-w-sm text-center text-4xl font-medium">
          You currently don't have any chats 🧐
        </h1>
        <NewChatDialog />
      </div>
    </div>
  );
};
