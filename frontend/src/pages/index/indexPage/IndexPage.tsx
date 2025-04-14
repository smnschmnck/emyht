import { Badge } from '@/components/ui/Bagde';
import { useContactRequests } from '@/hooks/api/contacts';
import emyhtLogo from '@assets/images/emyht-logo.svg';
import { createLink, LinkComponent } from '@tanstack/react-router';
import React, { FC } from 'react';
import ballonIllustration from './assets/balloon_illustration.svg';

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
  (props, ref) => {
    return (
      <a
        ref={ref}
        {...props}
        className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl border border-zinc-100 bg-white px-12 text-sm font-semibold shadow-xs transition hover:bg-zinc-100"
      />
    );
  }
);

const CreatedLinkComponent = createLink(BasicLinkComponent);

const CtaLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />;
};

export const IndexPage: FC = () => {
  const { data } = useContactRequests();
  const hasContactRequests = !!data && data.length > 0;

  return (
    <div className="hidden h-full w-full flex-col items-center justify-around px-32 lg:flex">
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
