import { Card } from '@/components/ui/Card';
import { IconLink } from '@/components/ui/IconLink';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';
import { RequestTable } from './RequestTable';

export const IncomingRequests: FC = () => {
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
          <XMarkIcon strokeWidth={3} className="text-zinc-500" />
        </IconLink>
      </div>
      <Card>
        <div className="w-full overflow-x-scroll">
          <div className="min-w-[32rem] pb-8">
            <RequestTable />
          </div>
        </div>
      </Card>
    </div>
  );
};
