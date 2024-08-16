import { CheckMarkIcon } from '@/assets/icons/CheckmarkIcon';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { useContactRequests } from '@/hooks/api/contacts';
import { NoSymbolIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';

export type ContactRequestActions = 'accept' | 'decline' | 'block';

type RequestTableProps = {
  handleRequest: (opts: {
    senderID: string;
    action: ContactRequestActions;
  }) => void;
};

export const RequestTable: FC<RequestTableProps> = ({ handleRequest }) => {
  const { data, isLoading } = useContactRequests();

  return (
    <div className="max-h-72 w-full overflow-scroll pr-4">
      <table className="h-fit w-full text-left text-sm">
        <thead>
          <tr className="sticky top-0 bg-white shadow-line">
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
                        senderID: r.senderID,
                        action: 'accept',
                      })
                    }
                  >
                    <CheckMarkIcon className="h-4 w-4" />
                  </IconButton>
                </td>
                <td className="py-3 text-red-500">
                  <IconButton
                    ariaLabel={'Decline request'}
                    className="text-red-500"
                    onClick={() =>
                      handleRequest({
                        senderID: r.senderID,
                        action: 'decline',
                      })
                    }
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </IconButton>
                </td>
                <td className="py-3 text-red-500">
                  <IconButton
                    ariaLabel={'Block request'}
                    className="text-red-500"
                    onClick={() =>
                      handleRequest({
                        senderID: r.senderID,
                        action: 'block',
                      })
                    }
                  >
                    <NoSymbolIcon className="h-6 w-6" />
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
