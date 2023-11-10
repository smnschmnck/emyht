import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FC } from 'react';
import { ContactRequestsTable } from './components/ContactRequestsTable';

export const ContactRequests: FC = () => {
  return (
    <div className="flex w-full flex-col gap-8 rounded-xl border border-zinc-100 bg-white p-10 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold">Your requests</h2>
        <p className="text-sm text-zinc-500">
          You asked contacts associated with these E-Mails to connect
        </p>
      </div>
      <div className="flex w-full gap-12">
        <ContactRequestsTable />
        <div className="flex h-fit flex-col gap-4 rounded-xl bg-zinc-50 p-8">
          <div className="pr-20">
            <h3 className="text-sm font-semibold">Send request</h3>
            <p className="w-max text-sm text-zinc-500">
              Send a new contact request
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full flex-col gap-2"
          >
            <Input placeholder="E-Mail" />
            <Button className="w-full">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};
