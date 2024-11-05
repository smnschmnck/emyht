import { FC, InputHTMLAttributes, ReactNode } from 'react';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export const Input: FC<InputProps> = ({
  startAdornment,
  endAdornment,
  ...props
}) => (
  <div className="flex h-10 w-full items-center justify-center gap-1 rounded-lg border border-zinc-200 bg-white px-2.5 transition focus-within:border-blue-500">
    {startAdornment}
    <input
      className="w-full bg-transparent outline-none placeholder:text-sm placeholder:text-zinc-500"
      type="text"
      {...props}
    />
    {endAdornment}
  </div>
);
