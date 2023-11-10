import { CloseIcon } from '@/assets/icons/CloseIcon';
import { Button } from '@/components/ui/Button';
import { IconButton } from '@/components/ui/IconButton';
import { Input } from '@/components/ui/Input';
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

export const ContactRequests: FC = () => {
  return (
    <div className="flex w-full flex-col gap-8 rounded-xl border border-zinc-100 bg-white p-10 shadow-sm">
      <div>
        <h2 className="text-sm font-semibold">Your requests</h2>
        <p className="text-sm text-zinc-500">
          You asked contacts associated with these E-Mails to connect
        </p>
      </div>
      <div className="flex w-full gap-12">
        <div className="max-h-72 w-full overflow-scroll pr-12">
          <table className="h-fit w-full text-left text-sm">
            <tr className="shadow-line sticky top-0 bg-white">
              <th className="pb-3 font-semibold">E-Mail</th>
              <th className="pb-3 font-semibold">Date</th>
              <th className="pb-3 text-right font-semibold">Cancel</th>
            </tr>
            {fakeRequests.map((r) => (
              <tr className="border-b border-b-zinc-100">
                <td className="max-w-xs truncate py-3 font-semibold">
                  {r.email}
                </td>
                <td className="py-3 text-zinc-500">{r.date}</td>
                <td className="flex justify-end py-3 text-red-500">
                  <IconButton
                    ariaLabel={'Cancel request'}
                    className="text-red-500"
                  >
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
        <div className="flex h-fit flex-col gap-4 rounded-xl bg-zinc-50 p-8">
          <div className="pr-12">
            <h3 className="text-sm font-semibold">Send request</h3>
            <p className="w-max text-sm text-zinc-500">
              Send a new contact request
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex w-full flex-col gap-2"
          >
            <Input placeholder="E-Mail" />
            <Button className="w-full">Send</Button>
          </form>
        </div>
      </div>
    </div>
  );
};
