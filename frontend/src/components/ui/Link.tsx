import { createLink } from '@tanstack/react-router';
import { forwardRef, ReactNode } from 'react';

const LinkWrapper = forwardRef<HTMLSpanElement, { children?: ReactNode }>(
  ({ children, ...props }, ref) => (
    <span
      ref={ref}
      className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
      {...props}
    >
      {children}
    </span>
  )
);

export const Link = createLink(LinkWrapper);
