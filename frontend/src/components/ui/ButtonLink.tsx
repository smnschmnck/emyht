import { Link, MakeLinkOptions } from '@tanstack/react-router';
import { FC, ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

export const ButtonLink: FC<MakeLinkOptions> = ({ children, ...props }) => (
  <Link
    {...props}
    className={twMerge(
      'inline-flex h-9 w-9 items-center justify-center rounded-md bg-white p-2 text-blue-600 transition hover:bg-blue-100',
      props.className
    )}
  >
    <div className="h-full w-full">{children as ReactNode}</div>
  </Link>
);
