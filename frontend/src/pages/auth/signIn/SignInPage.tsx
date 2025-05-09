import { getUserData } from '@/api/user';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { Link } from '@/components/ui/Link';
import { SimpleErrorMessage } from '@/components/ui/SimpleErrorMessage';
import { fetchWithDefaults } from '@/utils/fetch';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { FC, FormEvent, useState } from 'react';

export const SignInPage: FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signIn = async (event: FormEvent) => {
    event.preventDefault();

    const res = await fetchWithDefaults('/login', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        authMethod: 'cookie',
      }),
    });

    if (!res.ok) {
      throw new Error(await res.text());
    }

    return await getUserData();
  };

  const {
    isPending: isSigningIn,
    mutate: performSignIn,
    error: signInError,
  } = useMutation({
    mutationFn: signIn,
    onSuccess: ({ emailActive }) => {
      if (!emailActive) {
        navigate({
          to: '/no-email',
          replace: true,
        });
        return;
      }

      navigate({
        to: '/',
        replace: true,
      });
    },
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Welcome back</h1>
        <p className="text-sm text-zinc-500">
          Please sign in to start chatting
        </p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(e: FormEvent) => {
            if (!isSigningIn) {
              performSignIn(e);
            }
          }}
        >
          <FormInput
            label="E-Mail"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button isLoading={isSigningIn} type="submit">
            Sign in
          </Button>
        </form>
        {signInError && (
          <SimpleErrorMessage>{signInError.message}</SimpleErrorMessage>
        )}
        <div className="flex gap-2">
          <p className="text-sm text-zinc-500">No account?</p>
          <Link to="/sign-up">Sign up</Link>
        </div>
      </div>
    </div>
  );
};
