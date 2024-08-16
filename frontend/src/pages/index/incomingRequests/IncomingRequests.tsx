import { FC } from 'react';
import { ContactRequestActions, RequestTable } from './RequestTable';
import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';
import { useMutation } from '@tanstack/react-query';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { useContactRequests, useContacts } from '@/hooks/api/contacts';

export const IncomingRequests: FC = () => {
  const { refetch: refetchContacts } = useContacts();
  const { refetch: refetchContactRequests } = useContactRequests();

  const handleContactRequest = useMutation({
    mutationFn: async (opts: {
      senderID: string;
      action: ContactRequestActions;
    }) => {
      const res = await fetch(`${env.VITE_BACKEND_HOST}/handleContactRequest`, {
        method: 'post',
        body: JSON.stringify(opts),
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new HttpError({
          message: await res.text(),
          statusCode: res.status,
        });
      }
    },
    onSuccess: () => {
      refetchContacts();
      refetchContactRequests();
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll px-6 py-10 md:px-8 lg:px-10 xl:px-14">
      <div className="flex items-center gap-6">
        <ButtonLink to="/" aria-label={'back'} className="h-8 w-8 lg:hidden">
          <ChevronLeftIcon className="text-zinc-400" />
        </ButtonLink>
        <div>
          <h1 className="text-xl font-semibold">Contact requests</h1>
          <p className="text-sm text-zinc-500">
            These users would like to contact you
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-8 rounded-xl border border-zinc-100 bg-white p-10 shadow-sm">
        <div className="w-full overflow-x-scroll">
          <div className="min-w-[32rem] pb-8">
            <RequestTable handleRequest={handleContactRequest.mutate} />
          </div>
        </div>
      </div>
    </div>
  );
};
