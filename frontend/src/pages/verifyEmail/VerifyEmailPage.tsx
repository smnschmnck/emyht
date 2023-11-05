import { env } from '@/env';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { FC } from 'react';
import { verifyEmailRoute } from './route';
import { SimpleErrorMessage } from '@/components/ui/SimpleErrorMessage';
import { Link } from '@/components/ui/Link';
import { Spinner } from '@/components/ui/Spinner';

export const VerifyEmailPage: FC = () => {
  const { token } = useSearch({ from: verifyEmailRoute.id });

  const verifyEmail = async () => {
    const res = await fetch(`${env.VITE_BACKEND_HOST}/verifyEmail`, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        emailToken: token,
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return res.text();
  };

  const verifyEmailQuery = useQuery({
    queryKey: ['verifyEmail'],
    queryFn: verifyEmail,
    refetchOnWindowFocus: false,
  });

  if (verifyEmailQuery.isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h1 className="text-center text-2xl font-medium">
          Verifying your E-Mail
        </h1>
        <Spinner />
      </div>
    );
  }

  if (verifyEmailQuery.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h1 className="text-center text-4xl font-medium">
          E-Mail verification failed 😞
        </h1>
        <SimpleErrorMessage>
          {verifyEmailQuery.error.message}
        </SimpleErrorMessage>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <h1 className="text-center text-4xl font-medium">
        E-Mail verified successfully 🥳
      </h1>
      <Link to="/">Start using emyht</Link>
    </div>
  );
};
