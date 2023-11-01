import { EyeClosedIcon } from "@/assets/icons/EyeClosedIcon";
import { EyeOpenIcon } from "@/assets/icons/EyeOpenIcon";
import { FC } from "react";

type HideOrShowButtonProps = {
  show: boolean;
  setShowPassword: (showPassword: boolean) => void;
};

export const HideOrShowButton: FC<HideOrShowButtonProps> = ({
  show,
  setShowPassword: setShow,
}) => (
  <button
    className="text-zinc-400 w-6 h-6 hover:text-black transition"
    type="button"
    onClick={() => setShow(!show)}
  >
    {show ? <EyeClosedIcon /> : <EyeOpenIcon />}
  </button>
);
