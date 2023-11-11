import { LogOutIcon } from '@/assets/icons/LogOutIcon';
import { IconButton } from '@/components/ui/IconButton';
import { env } from '@/env';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { FC } from 'react';

export const LogOutButton: FC = () => {
  const navigate = useNavigate();
  const router = useRouter();

  const logOut = async () => {
    const res = await fetch(`${env.VITE_BACKEND_HOST}/logout`, {
      credentials: 'include',
    });

    if (res.ok) {
      await router.invalidate();
      navigate({ to: '/' });
    }
  };

  return (
    <IconButton onClick={logOut} ariaLabel="Sign out" className="text-white">
      <LogOutIcon />
    </IconButton>
  );
};
