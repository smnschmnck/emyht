import * as React from 'react';
import { createLink, LinkComponent } from '@tanstack/react-router';
import { twMerge } from 'tailwind-merge';

type BasicLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement>;

const BasicLinkComponent = React.forwardRef<HTMLAnchorElement, BasicLinkProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={twMerge(
          'inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white p-2 text-blue-600 transition hover:bg-blue-100',
          className
        )}
        {...props}
      >
        <div className="h-full w-full">{children}</div>
      </a>
    );
  }
);

const CreatedLinkComponent = createLink(BasicLinkComponent);

export const ButtonLink: LinkComponent<typeof BasicLinkComponent> = (props) => {
  return <CreatedLinkComponent preload={'intent'} {...props} />;
};
