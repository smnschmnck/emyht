import { IconButton } from '@/components/ui/IconButton';
import { useAuth0 } from '@auth0/auth0-react';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { FC } from 'react';

export const LogOutButton: FC = () => {
  const { logout } = useAuth0();

  return (
    <IconButton
      onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
      ariaLabel="Sign out"
      className="text-white"
    >
      <ArrowRightOnRectangleIcon />
    </IconButton>
  );
};
