import { ButtonHTMLAttributes, forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  classOverrides?: string;
  ariaLabel: string;
};

type RefType = HTMLButtonElement;

export const IconButton = forwardRef<RefType, IconButtonProps>((props, ref) => {
  const { className, ariaLabel, children, ...restProps } = props;

  return (
    <button
      ref={ref}
      className={twMerge(
        'grid h-9 w-9 cursor-pointer place-items-center rounded-lg p-1.5 text-blue-600 transition hover:bg-blue-300/25',
        className
      )}
      aria-label={ariaLabel}
      {...restProps}
    >
      {children}
    </button>
  );
});
