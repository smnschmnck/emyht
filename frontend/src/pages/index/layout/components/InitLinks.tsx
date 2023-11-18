import { Badge } from '@/components/ui/Bagde';
import { queryKeys } from '@/configs/queryKeys';
import { PlusIcon } from '@heroicons/react/24/outline';
import { UsersIcon } from '@heroicons/react/24/solid';
import { useQuery } from '@tanstack/react-query';
import { Link, MakeLinkOptions } from '@tanstack/react-router';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

const ButtonLink: FC<MakeLinkOptions> = (props) => (
  <Link
    {...props}
    className={twMerge(
      'inline-flex h-9 w-9 items-center justify-center rounded-md bg-white p-2 text-blue-600 hover:bg-blue-100',
      props.className
    )}
  />
);

export const InitLinks: FC = () => {
  const { data: contactRequests } = useQuery(
    queryKeys.contacts.incomingRequests
  );

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
