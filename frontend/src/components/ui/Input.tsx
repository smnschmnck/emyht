import { FC, InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input: FC<InputProps> = (props) => (
  <div className="w-full flex focus-within:border-blue-500 transition px-3 h-10 items-center border border-zinc-200 rounded-md">
    <input
      className="w-full outline-none text-sm placeholder:text-sm placeholder:text-gray-500"
      type="text"
      {...props}
    />
  </div>
);
