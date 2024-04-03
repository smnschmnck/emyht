import { Badge } from '@/components/ui/Bagde';
import { queryKeys } from '@/configs/queryKeys';
import { TLinkProps } from '@/router/config';
import emyhtLogo from '@assets/images/emyht-logo.svg';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import { FC, ReactNode } from 'react';
import ballonIllustration from './assets/balloon_illustration.svg';

const CtaLink = <TLinkOptions extends string = '.'>(
  props: TLinkProps<TLinkOptions> & { children: ReactNode }
) => (
  <Link
    className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-100 bg-white px-12 text-sm font-semibold shadow-sm transition hover:bg-zinc-100"
    {...props}
  />
);

export const IndexPage: FC = () => {
  const { data } = useQuery(queryKeys.contacts.incomingRequests);
  const hasContactRequests = !!data && data.length > 0;

  return (
    <div className="flex h-full w-full flex-col items-center justify-around px-32">
      <div className="flex flex-col items-center gap-4">
        <img className="pointer-events-none w-24" src={emyhtLogo} alt="emyht" />
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Welcome to emyht</h1>
          <p className="text-sm text-zinc-500">See what's happening</p>
        </div>
      </div>
      <img
        className="pointer-events-none max-w-xs"
        src={ballonIllustration}
        alt="balloons"
      />
      <div className="flex w-full flex-col gap-4 xl:flex-row 2xl:gap-8">
        <div className="relative w-full">
          {hasContactRequests && <Badge size="md">{data.length}</Badge>}
          <CtaLink to="/incoming-requests">
            Check incoming contact requests
          </CtaLink>
        </div>
        <CtaLink to="/initiate">Start new chat</CtaLink>
      </div>
    </div>
  );
};
