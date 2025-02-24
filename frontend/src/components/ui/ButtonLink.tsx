import { createLink } from '@tanstack/react-router';
import { forwardRef, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type ExtraProps = {
  children: ReactNode;
  className?: string;
  'aria-label': string;
};

const ButtonLinkWrapper = forwardRef<HTMLAnchorElement, ExtraProps>(
  ({ children, className, ...props }, ref) => (
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
  )
);

export const ButtonLink = createLink(ButtonLinkWrapper);
