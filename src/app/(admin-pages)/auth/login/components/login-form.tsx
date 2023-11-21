'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';

import { login } from '../actions';

import { ComponentProps, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const LoginForm = () => {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
    event.preventDefault(); // always add prevent default for onSubmit action

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { serverError, validationError } = await login({ email, password });

    if (serverError || validationError) {
      setIsLoading(false);
      setError(serverError || 'Validation error');
    }
  };

  return (
    <form method="post" className="relative mt-6" onSubmit={onSubmit}>
      <Alert
        variant="vibrant"
        className={twMerge(
          'pointer-events-none z-0 mb-2 min-h-[64px] transition-all duration-300 ease-in-out',
          error ? 'opacity-100' : 'absolute h-0 opacity-0'
        )}
      >
        <AlertTitle>Login Failed</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <Input
        className="relative z-10"
        type="email"
        name="email"
        placeholder="Email"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect="off"
        required
      />
      <Input
        className="z-10 mt-2"
        type="password"
        name="password"
        placeholder="Password"
        autoCapitalize="none"
        autoComplete="email"
        autoCorrect="off"
        required
      />
      <Button className="z-10 mt-2 w-full font-semibold" type="submit" disabled={isLoading}>
        {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
};

export default LoginForm;
