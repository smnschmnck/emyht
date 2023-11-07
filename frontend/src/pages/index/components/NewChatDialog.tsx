import { Button } from '@/components/ui/Button';
import { FC } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';

export const NewChatDialog: FC = () => (
  <Dialog>
    <DialogTrigger className="w-full">
      <Button className="w-full">Start a new chat</Button>
    </DialogTrigger>
    <DialogContent className="flex h-full flex-col">
      <DialogTitle>New chat</DialogTitle>
      <div className="flex h-full flex-col justify-between">
        <p>blaa</p>
        <DialogClose className="flex w-full items-center justify-center">
          <p className="text-sm font-medium text-blue-600 hover:underline">
            Close
          </p>
        </DialogClose>
      </div>
    </DialogContent>
  </Dialog>
);
