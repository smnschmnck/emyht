import { Link } from '@/components/ui/Link';
import { useRouteContext } from '@tanstack/react-router';
import { FC } from 'react';
import { noEmailRoute } from './route';

export const NoEmailPage: FC = () => {
  const userData = useRouteContext({ from: noEmailRoute.id });

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-10 text-center text-sm">
      <div className="flex flex-col gap-4">
        <h1 className="text-4xl font-semibold">Verify your E-Mail</h1>
        <p className="max-w-md text-center text-zinc-500">
          We have sent an E-Mail with a verification link to
          <span className="font-semibold text-blue-400">
            {' '}
            {userData.email}
          </span>{' '}
          to verify that your E-Mail address really belongs to you. Please open
          the E-Mail and click on the Link.
        </p>
      </div>
      <span className="text-6xl">✉️</span>
      <div className="flex flex-col gap-1">
        <p className="text-zinc-500">You did not receive an E-Mail?</p>
        <Link to="/no-email">Resend E-Mail</Link>
      </div>
      <span className="text-3xl">🤔</span>
      <div className="flex flex-col gap-1">
        <p className="text-zinc-500">
          <span className="font-semibold text-blue-400">{userData.email}</span>{' '}
          does not look like your E-Mail?
        </p>
        <Link>Change E-Mail Address</Link>
      </div>
    </div>
  );
};
