import { Badge } from '@/components/ui/Bagde';
import { ButtonLink } from '@/components/ui/ButtonLink';
import { useContactRequests } from '@/hooks/api/contacts';
import { PlusIcon } from '@heroicons/react/24/outline';
import { UsersIcon } from '@heroicons/react/24/solid';
import { FC } from 'react';

export const InitLinks: FC = () => {
  const { data: contactRequests } = useContactRequests();

  const hasContactRequests = !!contactRequests && contactRequests.length > 0;

  return (
    <div className="flex items-center gap-2 rounded-lg bg-zinc-100 p-1">
      <div className="relative">
        {hasContactRequests && (
          <Badge size="sm">{contactRequests.length}</Badge>
        )}
        <ButtonLink to="/incoming-requests" aria-label="Start new chat">
          <UsersIcon />
        </ButtonLink>
      </div>
      <hr className="h-6 w-0.5 rounded-full bg-zinc-300" />
      <ButtonLink to="/initiate" aria-label="Start new chat" className="p-1.5">
        <PlusIcon strokeWidth={2} />
      </ButtonLink>
    </div>
  );
};
