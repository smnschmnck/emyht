import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, FC } from 'react';
import { twMerge } from 'tailwind-merge';

const buttonVariants = cva(
  'h-9 rounded-md px-4 text-sm font-medium transition disabled:bg-zinc-100 disabled:text-zinc-200',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-500',
        secondary: 'text-blue-600 bg-zinc-100 hover:bg-zinc-200',
        secondaryDestructive: 'text-red-600 bg-zinc-100 hover:bg-zinc-200',
        text: 'text-blue-600 hover:bg-zinc-100',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

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
