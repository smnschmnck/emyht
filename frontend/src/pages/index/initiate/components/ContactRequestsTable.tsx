import { IconButton } from '@/components/ui/IconButton';
import { Spinner } from '@/components/ui/Spinner';
import { useSentContactRequests } from '@/hooks/api/contacts';
import { formatTimestamp } from '@/utils/dateUtils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';

const ContactRequestsTableDesktop: FC = () => {
  const { data, isLoading } = useSentContactRequests();

  return (
    <div className="max-h-72 w-full overflow-scroll pr-4">
      <table className="h-fit w-full text-left text-sm">
        <thead>
          <tr className="shadow-line sticky top-0 bg-white">
            <th className="pb-3 font-semibold">E-Mail</th>
            <th className="pb-3 font-semibold">Date</th>
            <th className="pb-3 text-right font-semibold">Cancel</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((r) => (
              <tr key={r.email} className="border-b border-b-zinc-100">
                <td className="max-w-xs truncate py-3 pr-2 font-semibold">
                  {r.email}
                </td>
                <td className="py-3 text-zinc-500">
                  {formatTimestamp(r.createdAt)}
                </td>
                <td className="flex justify-end py-3 text-red-500">
                  <IconButton
                    ariaLabel={'Cancel request'}
                    className="text-red-500"
                  >
                    <XMarkIcon />
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

const ContactRequestsTableMobile: FC = () => {
  const { data, isLoading } = useSentContactRequests();

  return (
    <div className="max-h-72 w-full pr-4">
      <table className="h-fit w-full text-left text-sm">
        <thead>
          <tr className="shadow-line sticky top-0 bg-white">
            <th className="pb-3 font-semibold">Request</th>
            <th className="pb-3 text-right font-semibold">Cancel</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            data.map((r) => (
              <tr key={r.email} className="border-b border-b-zinc-100">
                <td className="py-3">
                  <div className="flex flex-col">
                    <span className="block max-w-[200px] truncate font-semibold">
                      {r.email}
                    </span>
                    <span className="block text-zinc-500">
                      {formatTimestamp(r.createdAt)}
                    </span>
                  </div>
                </td>
                <td className="flex items-center justify-end py-3 text-red-500">
                  <IconButton
                    ariaLabel={'Cancel request'}
                    className="text-red-500"
                  >
                    <XMarkIcon />
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

export const ContactRequestsTable: FC = () => (
  <>
    <div className="hidden w-full lg:block">
      <ContactRequestsTableDesktop />
    </div>
    <div className="block w-full lg:hidden">
      <ContactRequestsTableMobile />
    </div>
  </>
);
