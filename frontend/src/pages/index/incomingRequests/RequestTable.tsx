import { FC } from 'react';
import { CloseIcon } from '@/assets/icons/CloseIcon';
import { Avatar } from '@/components/ui/Avatar';
import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { queryKeys } from '@/configs/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { CheckMarkIcon } from '@/assets/icons/CheckmarkIcon';
import { NoEntryIcon } from '@/assets/icons/NoEntryIcon';

export type ContactRequestActions = 'accept' | 'decline' | 'block';

type RequestTableProps = {
  handleRequest: (opts: {
    senderID: string;
    action: ContactRequestActions;
  }) => void;
};

export const RequestTable: FC<RequestTableProps> = ({ handleRequest }) => {
  const { data, isLoading } = useQuery(queryKeys.contacts.incomingRequests);

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
                    <CloseIcon className="h-6 w-6" />
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
                    <NoEntryIcon className="h-6 w-6" />
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
