import { Badge } from '@/components/ui/Bagde';
import { IconLink } from '@/components/ui/IconLink';
import { useContactRequests } from '@/hooks/api/contacts';
import { PlusIcon } from '@heroicons/react/24/outline';
import { UsersIcon } from '@heroicons/react/24/solid';
import { FC } from 'react';

export const InitLinks: FC = () => {
  const { data: contactRequests } = useContactRequests();

  const hasContactRequests = !!contactRequests && contactRequests.length > 0;

  return (
    <div className="flex items-center gap-2 rounded-xl bg-zinc-100 p-1">
      <div className="relative">
        {hasContactRequests && (
          <Badge size="sm">{contactRequests.length}</Badge>
        )}
        <IconLink to="/incoming-requests" aria-label="Start new chat">
          <UsersIcon />
        </IconLink>
      </div>
      <hr className="h-6 w-0.5 rounded-full bg-zinc-300" />
      <IconLink to="/initiate" aria-label="Start new chat" className="p-1.5">
        <PlusIcon strokeWidth={2} />
      </IconLink>
    </div>
  );
};
