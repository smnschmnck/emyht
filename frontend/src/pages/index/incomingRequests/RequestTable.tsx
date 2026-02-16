import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { HttpError } from '@/errors/httpError/httpError';
import { useContactRequests, useContacts } from '@/hooks/api/contacts';
import { useBlockUser } from '@/hooks/api/user';
import { useAuthFetch } from '@/hooks/useAuthFetch';
import {
  CheckIcon,
  NoSymbolIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useMutation } from '@tanstack/react-query';
import { FC } from 'react';
import { toast } from 'sonner';

type ContactRequestActions = 'accept' | 'decline' | 'block';

export const RequestTable: FC = () => {
  const { refetch: refetchContacts } = useContacts();
  const {
    data,
    isLoading,
    refetch: refetchContactRequests,
  } = useContactRequests();
  const authFetch = useAuthFetch();

  const { mutate: handleRequest } = useMutation({
    mutationFn: async (opts: {
      senderID: string;
      action: ContactRequestActions;
    }) => {
      const res = await authFetch('/handleContactRequest', {
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

  const { mutate: blockUser } = useBlockUser({
    onSuccess: () => {
      toast.success('User blocked successfully');
      refetchContactRequests();
    },
  });

  return (
    <div className="max-h-72 w-full overflow-scroll pr-4">
      <table className="h-fit w-full text-left text-sm">
        <thead>
          <tr className="shadow-line sticky top-0 bg-white">
            <th className="pb-3 font-semibold">E-Mail</th>
            <th />
            <th className="pb-3 font-semibold">Username</th>
            <th className="pb-3 font-semibold">Accept</th>
            <th className="pb-3 font-semibold">Decline</th>
            <th className="pb-3 font-semibold">Block</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((r) => (
              <tr key={r.senderEmail} className="border-b border-b-zinc-100">
                <td className="w-14">
                  <Avatar
                    imgUrl={r.senderProfilePicture}
                    alt={r.senderUsername}
                  />
                </td>
                <td className="w-0 max-w-xs truncate py-3 pr-14 font-semibold">
                  {r.senderEmail}
                </td>
                <td className="py-3 text-zinc-500">{r.senderUsername}</td>
                <td className="py-3 text-red-500">
                  <IconButton
                    ariaLabel={'Accept request'}
                    className="text-blue-500"
                    onClick={() =>
                      handleRequest({
                        senderID: r.senderId,
                        action: 'accept',
                      })
                    }
                  >
                    <CheckIcon />
                  </IconButton>
                </td>
                <td className="py-3 text-red-500">
                  <IconButton
                    ariaLabel={'Decline request'}
                    className="text-red-500"
                    onClick={() =>
                      handleRequest({
                        senderID: r.senderId,
                        action: 'decline',
                      })
                    }
                  >
                    <XMarkIcon />
                  </IconButton>
                </td>
                <td className="py-3 text-red-500">
                  <IconButton
                    ariaLabel={'Block request'}
                    className="text-red-500"
                    onClick={() => blockUser(r.senderId)}
                  >
                    <NoSymbolIcon />
                  </IconButton>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {isLoading && (
        <div className="flex w-full justify-center pt-12">
          <span className="text-sm font-semibold text-zinc-500">
            <Spinner />
          </span>
        </div>
      )}
      {data && data.length <= 0 && (
        <div className="flex w-full justify-center pt-12">
          <span className="text-sm font-semibold text-zinc-500">
            No requests
          </span>
        </div>
      )}
    </div>
  );
};
