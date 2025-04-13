import { cva, VariantProps } from 'class-variance-authority';
import { FC } from 'react';

const spinnerVariants = cva('animate-spin-fast  rounded-full border-2 ', {
  variants: {
    variant: {
      primary: 'border-blue-600 border-r-blue-200',
      bright: 'border-blue-400 border-r-white',
    },
    size: {
      default: 'h-6 w-6',
      sm: 'h-4 w-4',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'default',
  },
});

type SpinnerProps = VariantProps<typeof spinnerVariants>;

export const Spinner: FC<SpinnerProps> = ({ variant, size }) => (
  <div className={spinnerVariants({ variant, size })} />
);
