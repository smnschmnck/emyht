import { CloseIcon } from '@/assets/icons/CloseIcon';
import { IconButton } from '@/components/ui/IconButton';
import { FC } from 'react';

const fakeRequests: { email: string; date: string }[] = [
  {
    email: 'email@example.com',
    date: '03.11.2022',
  },
  {
    email: 'email@example.com',
    date: '03.11.2022',
  },
  {
    email: 'email@example.com',
    date: '03.11.2022',
  },
  {
    email: 'email@example.com',
    date: '03.11.2022',
  },
  {
    email: 'email@example.com',
    date: '03.11.2022',
  },
];

export const ContactRequestsTable: FC = () => {
  return (
    <div className="max-h-72 w-full overflow-scroll pr-4">
      <table className="h-fit w-full text-left text-sm">
        <tr className="sticky top-0 bg-white shadow-line">
          <th className="pb-3 font-semibold">E-Mail</th>
          <th className="pb-3 font-semibold">Date</th>
          <th className="pb-3 text-right font-semibold">Cancel</th>
        </tr>
        {fakeRequests.map((r) => (
          <tr className="border-b border-b-zinc-100">
            <td className="max-w-xs truncate py-3 font-semibold">{r.email}</td>
            <td className="py-3 text-zinc-500">{r.date}</td>
            <td className="flex justify-end py-3 text-red-500">
              <IconButton ariaLabel={'Cancel request'} className="text-red-500">
                <CloseIcon />
              </IconButton>
            </td>
          </tr>
        ))}
      </table>
      {fakeRequests.length <= 0 && (
        <div className="flex w-full justify-center pt-12">
          <span className="text-sm font-semibold text-zinc-500">
            No requests
          </span>
        </div>
      )}
    </div>
  );
};
