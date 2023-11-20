import { Link, MakeLinkOptions } from '@tanstack/react-router';
import { FC } from 'react';
import { twMerge } from 'tailwind-merge';

export const ButtonLink: FC<MakeLinkOptions> = (props) => (
  <Link
    {...props}
    className={twMerge(
      'inline-flex h-9 w-9 items-center justify-center rounded-md bg-white p-2 text-blue-600 hover:bg-blue-100',
      props.className
    )}
  />
);
