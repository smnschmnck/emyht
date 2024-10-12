import { createLink } from '@tanstack/react-router';
import { forwardRef, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

type ExtraProps = {
  children: ReactNode;
  className?: string;
  'aria-label': string;
};

const ButtonLinkWrapper = forwardRef<HTMLDivElement, ExtraProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={twMerge(
        'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md bg-white p-2 text-blue-600 transition hover:bg-blue-100',
        className
      )}
      {...props}
    >
      <div className="h-full w-full">{children}</div>
    </div>
  )
);

export const ButtonLink = createLink(ButtonLinkWrapper);
