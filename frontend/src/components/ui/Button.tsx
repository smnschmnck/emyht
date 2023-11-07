import { ButtonHTMLAttributes, FC } from 'react';
import { twMerge } from 'tailwind-merge';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({
  children,
  type = 'button',
  className,
  ...props
}) => (
  <button
    className={twMerge(
      'h-10 rounded-md bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-500',
      className
    )}
    type={type}
    {...props}
  >
    {children}
  </button>
);
