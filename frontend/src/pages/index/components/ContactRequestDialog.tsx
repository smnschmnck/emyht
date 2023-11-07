import { FC } from 'react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';

export const ContactRequestDialog: FC = () => {
  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <Button className="w-full">Send a contact request</Button>
      </DialogTrigger>
      <DialogContent className="flex h-full flex-col">
        <DialogTitle>Add contact 👋</DialogTitle>
        <div className="flex h-full flex-col justify-between">
          <DialogClose className="flex w-full items-center justify-center">
            <p className="text-sm font-medium text-blue-600 hover:underline">
              Close
            </p>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
