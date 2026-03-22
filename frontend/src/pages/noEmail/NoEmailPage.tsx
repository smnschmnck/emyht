import emyhtLogo from '@assets/images/emyht-logo.svg';
import { useAuth0 } from '@auth0/auth0-react';
import { FC } from 'react';

export const NoEmailPage: FC = () => {
  const { logout } = useAuth0();

  return (
    <div className="h-full w-full p-12">
      <img className="w-24" src={emyhtLogo} alt="emyht" />
      <div className="flex h-full flex-col items-center justify-center gap-10 text-center text-sm">
        <div className="flex flex-col gap-4">
          <h1 className="text-4xl font-semibold">Verify your E-Mail</h1>
          <p className="max-w-md text-center text-zinc-500">
            We have sent an E-Mail with a verification link to your address to
            verify that your E-Mail address really belongs to you. Please open
            the E-Mail and click on the Link.
          </p>
        </div>
        <span className="text-6xl">&#9993;&#65039;</span>
        <div className="flex flex-col gap-1">
          <p className="text-zinc-500">Already verified?</p>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};
