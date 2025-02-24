import { createLink } from '@tanstack/react-router';
import { AnchorHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

type IconLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  ariaLabel: string;
};

export const IconLinkWrapper = ({
  className,
  ariaLabel,
  children,
  ...restProps
}: IconLinkProps) => {
  return (
    <a
      className={twMerge(
        'grid h-9 w-9 place-items-center rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-300/25',
        className
      )}
      aria-label={ariaLabel}
      {...restProps}
    >
      {children}
    </a>
  );
};

export const IconLink = createLink(IconLinkWrapper);
