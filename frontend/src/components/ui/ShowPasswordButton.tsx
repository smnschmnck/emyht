import { EyeClosedIcon } from "@/assets/icons/EyeClosedIcon";
import { EyeOpenIcon } from "@/assets/icons/EyeOpenIcon";
import { FC } from "react";

type ShowPasswordButtonProps = {
  showPassword: boolean;
  setShowPassword: (showPassword: boolean) => void;
};

export const ShowPasswordButton: FC<ShowPasswordButtonProps> = ({
  showPassword,
  setShowPassword,
}) => (
  <button
    className="text-zinc-500 w-6 h-6"
    type="button"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
  </button>
);
