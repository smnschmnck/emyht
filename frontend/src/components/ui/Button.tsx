import { ButtonHTMLAttributes, FC } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button: FC<ButtonProps> = ({ children, ...props }) => (
  <button
    className="w-full h-10 rounded-md hover:bg-blue-500 transition bg-blue-600 font-medium text-sm text-white"
    {...props}
  >
    {children}
  </button>
);
