import { IconLink } from '@/components/ui/IconLink';
import { HttpError } from '@/errors/httpError/httpError';
import { useContactRequests, useContacts } from '@/hooks/api/contacts';
import { fetchWithDefaults } from '@/utils/fetch';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { ContactRequestActions, RequestTable } from './RequestTable';

export const IncomingRequests: FC = () => {
  const { refetch: refetchContacts } = useContacts();
  const { refetch: refetchContactRequests } = useContactRequests();

  const handleContactRequest = useMutation({
    mutationFn: async (opts: {
      senderID: string;
      action: ContactRequestActions;
    }) => {
      const res = await fetchWithDefaults('/handleContactRequest', {
        method: 'post',
        body: JSON.stringify(opts),
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
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-semibold">Contact requests</h1>
          <p className="text-sm text-zinc-500">
            These users would like to contact you
          </p>
        </div>
        <IconLink to="/" aria-label={'back'} className="h-8 w-8">
          <XMarkIcon strokeWidth={2} className="text-zinc-500" />
        </IconLink>
      </div>
      <div className="flex w-full flex-col gap-8 rounded-xl border border-zinc-100 bg-white p-10 shadow-xs">
        <div className="w-full overflow-x-scroll">
          <div className="min-w-[32rem] pb-8">
            <RequestTable handleRequest={handleContactRequest.mutate} />
          </div>
        </div>
      </div>
    </div>
  );
};
