import { IconButton } from '@/components/ui/IconButton';
import { fetchWithDefaults } from '@/utils/fetch';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { FC } from 'react';

export const LogOutButton: FC = () => {
  const navigate = useNavigate();
  const router = useRouter();

  const logOut = async () => {
    const res = await fetchWithDefaults('/logout');

    if (res.ok) {
      await router.invalidate();
      navigate({ to: '/sign-in' });
    }
  };

  return (
    <IconButton onClick={logOut} ariaLabel="Sign out" className="text-white">
      <ArrowRightOnRectangleIcon />
    </IconButton>
  );
};
