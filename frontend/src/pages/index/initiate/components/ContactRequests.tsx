import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSentContactRequests } from '@/hooks/api/contacts';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import { useMutation } from '@tanstack/react-query';
import { FC, FormEvent, useState } from 'react';
import { toast } from 'sonner';
import { ContactRequestsTable } from './ContactRequestsTable';
import { Card } from '@/components/ui/Card';

export const ContactRequests: FC = () => {
  const [recepientEmail, setRecepientEmail] = useState('');
  const { refetch: refetchSentContactRequests } = useSentContactRequests();
  const authFetch = useAuthFetch();

  const { mutate: sendRequest } = useMutation({
    mutationFn: async (event: FormEvent) => {
      event.preventDefault();

      const res = await authFetch('/contactRequest', {
        method: 'post',
        body: JSON.stringify({
          contactEmail: recepientEmail,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }
    },
    onSuccess: () => {
      refetchSentContactRequests();
      toast.success('Contact request sent successfully');
    },
    onError: (e) => {
      toast.error(e.message);
    },
  });

  return (
    <Card>
      <div>
        <h2 className="text-sm font-semibold">Your sent requests</h2>
        <p className="text-sm text-zinc-500">
          You asked contacts associated with these E-Mails to connect
        </p>
      </div>
      <div className="flex w-full flex-col gap-12 xl:flex-row">
        <ContactRequestsTable />
        <div className="flex h-fit w-full max-w-full flex-col gap-4 rounded-xl bg-zinc-50 p-6 lg:p-8 xl:max-w-96">
          <div className="w-full pr-8">
            <h3 className="text-sm font-semibold">Send request</h3>
            <p className="flex w-full text-sm text-zinc-500">
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
    </Card>
  );
};
