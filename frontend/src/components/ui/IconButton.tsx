import { ButtonHTMLAttributes, FC } from 'react';
import { twMerge } from 'tailwind-merge';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  classOverrides?: string;
  ariaLabel: string;
};

export const IconButton: FC<IconButtonProps> = ({
  className,
  ariaLabel,
  children,
  ...props
}) => (
  <button
    className={twMerge(
      'flex h-9 w-9 items-center justify-center rounded-md p-1.5 text-blue-600 transition hover:bg-blue-300/25',
      className
    )}
    aria-label={ariaLabel}
    {...props}
  >
    <div className="h-full w-full">{children}</div>
  </button>
);
