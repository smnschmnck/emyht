import { ButtonHTMLAttributes, FC } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({
  children,
  type = 'button',
  ...props
}) => (
  <button
    className="h-10 w-full rounded-md bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-500"
    type={type}
    {...props}
  >
    {children}
  </button>
);
