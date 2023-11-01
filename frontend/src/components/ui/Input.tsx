import { FC, InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export const Input: FC<InputProps> = ({
  startAdornment,
  endAdornment,
  ...props
}) => (
  <div className="w-full flex gap-1 justify-center focus-within:border-blue-500 transition px-3 h-10 items-center border border-zinc-200 rounded-md">
    {startAdornment}
    <input
      className="w-full outline-none text-sm placeholder:text-sm placeholder:text-zinc-500"
      type="text"
      {...props}
    />
    {endAdornment}
  </div>
);
