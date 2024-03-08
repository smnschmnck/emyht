import { VariantProps, cva } from 'class-variance-authority';
import { FC, ReactNode } from 'react';

const badgeVariants = cva(
  'pointer-events-none absolute right-[-0.25rem] top-[-0.25rem] flex items-center justify-center rounded-full bg-red-500 font-semibold text-white',
  {
    variants: {
      size: {
        sm: 'h-4 w-4 text-xs',
        md: 'h-5 w-5 text-sm',
        lg: 'h-6 w-6 text-md',
      },
    },
    defaultVariants: {
      size: 'sm',
    },
  }
);

type BadgeProps = VariantProps<typeof badgeVariants> & {
  children: ReactNode;
  className?: string;
};

export const Badge: FC<BadgeProps> = ({ children, size, className }) => (
  <span className={badgeVariants({ size, className })}>{children}</span>
);
