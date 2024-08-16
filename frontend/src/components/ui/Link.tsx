import { createLink } from '@tanstack/react-router';
import { ReactNode } from 'react';

const LinkWrapper = ({ ...props }: { children?: ReactNode }) => (
  <span
    className="cursor-pointer text-sm font-medium text-blue-600 hover:underline"
    {...props}
  />
);

export const Link = createLink(LinkWrapper);
