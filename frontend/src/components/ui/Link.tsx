import { TLinkProps } from '@/router/config';
import { Link as RouterLink } from '@tanstack/react-router';
import { ReactNode } from 'react';

type ExtraProps = {
  children: ReactNode;
};

export const Link = <TLinkOptions extends string = '.'>({
  ...props
}: TLinkProps<TLinkOptions> & ExtraProps) => (
  <RouterLink
    className="text-sm font-medium text-blue-600 hover:underline"
    {...props}
  />
);
