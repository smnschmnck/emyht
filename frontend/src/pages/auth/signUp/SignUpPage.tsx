import { getUserData } from '@/api/user';
import { Button } from '@/components/ui/Button';
import { FormInput } from '@/components/ui/FormInput';
import { Link } from '@/components/ui/Link';
import { SimpleErrorMessage } from '@/components/ui/SimpleErrorMessage';
import { fetchWithDefaults } from '@/utils/fetch';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { FC, FormEvent, useState } from 'react';

export const SignUpPage: FC = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatedPassword, setRepeatedPassword] = useState('');

  const signUp = async (event: FormEvent) => {
    event.preventDefault();

    const res = await fetchWithDefaults('/register', {
      method: 'POST',
      body: JSON.stringify({
        username,
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
    mutate: performSignUp,
    error: signUpError,
    isPending: isSigningUp,
  } = useMutation({
    mutationFn: signUp,
    onSuccess: () => {
      navigate({
        to: '/no-email',
      });
    },
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold">Create account</h1>
        <p className="text-sm text-zinc-500">Please enter your details</p>
      </div>
      <div className="flex flex-col items-center gap-4">
        <form
          className="flex w-full flex-col gap-4"
          onSubmit={(e: FormEvent) => {
            if (!isSigningUp) {
              performSignUp(e);
            }
          }}
        >
          <FormInput
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <FormInput
            type="email"
            label="E-Mail"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormInput
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <FormInput
            type="password"
            label="Repeat password"
            value={repeatedPassword}
            onChange={(e) => setRepeatedPassword(e.target.value)}
          />
          <Button disabled={isSigningUp} isLoading={isSigningUp} type="submit">
            Sign up
          </Button>
        </form>
        {!!signUpError && (
          <SimpleErrorMessage>{signUpError.message}</SimpleErrorMessage>
        )}
        <div className="flex gap-2">
          <p className="text-sm text-zinc-500">Already got an account?</p>
          <Link to="/sign-in">Sign in</Link>
        </div>
      </div>
    </div>
  );
};
