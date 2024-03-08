import { FC } from 'react';
import { ContactRequestActions, RequestTable } from './RequestTable';
import { env } from '@/env';
import { HttpError } from '@/errors/httpError/httpError';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/configs/queryKeys';

export const IncomingRequests: FC = () => {
  const queryClient = useQueryClient();

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
      queryClient.refetchQueries(queryKeys.contacts.all);
      queryClient.refetchQueries(queryKeys.contacts.incomingRequests);
    },
  });

  return (
    <div className="flex h-full w-full flex-col gap-8 overflow-scroll p-14">
      <div>
        <h1 className="text-xl font-semibold">Contact requests</h1>
        <p className="text-sm text-zinc-500">
          These users would like to contact you
        </p>
      </div>
      <div className="flex w-full flex-col gap-8 rounded-xl border border-zinc-100 bg-white p-10 shadow-sm">
        <RequestTable handleRequest={handleContactRequest.mutate} />
      </div>
    </div>
  );
};
