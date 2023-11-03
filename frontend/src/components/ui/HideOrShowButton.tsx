import { EyeClosedIcon } from '@/assets/icons/EyeClosedIcon';
import { EyeOpenIcon } from '@/assets/icons/EyeOpenIcon';
import { FC } from 'react';

type HideOrShowButtonProps = {
  show: boolean;
  setShowPassword: (showPassword: boolean) => void;
};

export const HideOrShowButton: FC<HideOrShowButtonProps> = ({
  show,
  setShowPassword: setShow,
}) => (
  <button
    className="h-6 w-6 text-zinc-400 transition hover:text-black"
    type="button"
    onClick={() => setShow(!show)}
  >
    {show ? <EyeClosedIcon /> : <EyeOpenIcon />}
  </button>
);
