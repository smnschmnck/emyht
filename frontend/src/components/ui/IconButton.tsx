import { ButtonHTMLAttributes, FC } from 'react';
import { twMerge } from 'tailwind-merge';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  classOverrides?: string;
  ariaLabel: string;
};

export const IconButton: FC<IconButtonProps> = ({
  classOverrides,
  ariaLabel,
  ...props
}) => (
  <button
    className={twMerge(
      'flex h-9 w-9 items-center justify-center rounded-full transition hover:bg-white/25',
      classOverrides
    )}
    aria-label={ariaLabel}
    {...props}
  />
);
