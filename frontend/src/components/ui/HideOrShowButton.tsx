import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
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
    aria-label={`${show ? 'Hide' : 'Show'} field content`}
  >
    {show ? <EyeSlashIcon /> : <EyeIcon />}
  </button>
);
