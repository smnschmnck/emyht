import { Link } from '@/components/ui/Link';
import { SimpleErrorMessage } from '@/components/ui/SimpleErrorMessage';
import { Spinner } from '@/components/ui/Spinner';
import { fetchWithDefaults } from '@/utils/fetch';
import { useQuery } from '@tanstack/react-query';
import { useSearch } from '@tanstack/react-router';
import { FC } from 'react';
import { verifyEmailRoute } from './route';

export const VerifyEmailPage: FC = () => {
  const { token } = useSearch({ from: verifyEmailRoute.id });

  const verifyEmail = async () => {
    const res = await fetchWithDefaults('/verifyEmail', {
      method: 'post',
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
        <h1 className="text-center text-2xl font-semibold">
          Verifying your E-Mail
        </h1>
        <Spinner />
      </div>
    );
  }

  if (verifyEmailQuery.isError) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <h1 className="text-center text-4xl font-semibold">
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
      <h1 className="text-center text-4xl font-semibold">
        E-Mail verified successfully 🥳
      </h1>
      <Link to="/">Start using emyht</Link>
    </div>
  );
};
