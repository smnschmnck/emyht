import { MakeLinkOptions, Link as RouterLink } from '@tanstack/react-router';
import { FC } from 'react';

interface ButtonLinkProps extends MakeLinkOptions {
  children: string;
}

export const Link: FC<ButtonLinkProps> = ({ children, ...linkOptions }) => (
  <RouterLink
    className="text-sm font-medium text-blue-600 hover:underline"
    {...linkOptions}
  >
    {children}
  </RouterLink>
);
