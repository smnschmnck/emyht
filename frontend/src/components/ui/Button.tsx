import { cva, type VariantProps } from 'class-variance-authority';
import { ButtonHTMLAttributes, FC } from 'react';
import { twMerge } from 'tailwind-merge';
import { Spinner } from './Spinner';

const buttonVariants = cva(
  'h-10 rounded-lg px-4 text-sm font-medium transition disabled:opacity-50 disabled:pointer-events-none focus:ring-2 ring-offset-2 focus:ring-blue-600 outline-hidden',
  {
    variants: {
      variant: {
        primary: 'bg-blue-600 text-white hover:bg-blue-500',
        destructive: 'bg-red-500 text-white hover:bg-red-400',
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
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button: FC<ButtonProps> = ({
  children,
  type = 'button',
  className,
  variant,
  disabled,
  isLoading,
  ...props
}) => (
  <button
    disabled={disabled || isLoading}
    className={twMerge(buttonVariants({ variant, className }))}
    type={type}
    {...props}
  >
    <span className="flex items-center justify-center gap-2">
      {!!isLoading && <Spinner variant="bright" size="sm" />}
      {children}
    </span>
  </button>
);
