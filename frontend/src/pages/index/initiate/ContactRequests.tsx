import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FC, FormEvent, useState } from 'react';
import { ContactRequestsTable } from './components/ContactRequestsTable';
import { useMutation } from '@tanstack/react-query';
import { env } from '@/env';
import { toast } from 'sonner';

export const ContactRequests: FC = () => {
  const [recepientEmail, setRecepientEmail] = useState('');

  const { mutate: sendRequest } = useMutation({
    mutationFn: async (event: FormEvent) => {
      event.preventDefault();

      const res = await fetch(`${env.VITE_BACKEND_HOST}/contactRequest`, {
        method: 'post',
        body: JSON.stringify({
          contactEmail: recepientEmail,
        }),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      toast.success('Contact request sent successfully', {
        position: 'top-right',
      });
    },
  });

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
          <form onSubmit={sendRequest} className="flex w-full flex-col gap-2">
            <Input
              placeholder="E-Mail"
              value={recepientEmail}
              onChange={(e) => setRecepientEmail(e.target.value)}
            />
            <Button className="w-full" type="submit">
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
