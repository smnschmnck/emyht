import { cva } from 'class-variance-authority';
import { ButtonHTMLAttributes, FC } from 'react';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'h-10 rounded-md px-4 text-sm font-medium transition disabled:bg-zinc-100 disabled:text-zinc-200',
  {
    variants: {
      variant: {
        primary: 'bg-blue-500 text-white hover:bg-blue-400',
        secondary: 'text-blue-500 bg-zinc-100 hover:bg-zinc-200',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export const Button: FC<ButtonProps> = ({
  children,
  type = 'button',
  className,
  variant,
  ...props
}) => (
  <button
    className={twMerge(buttonVariants({ variant, className }))}
    type={type}
    {...props}
  >
    {children}
  </button>
);
