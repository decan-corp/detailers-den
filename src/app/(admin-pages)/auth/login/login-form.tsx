'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { AdminRoute } from 'src/constants/routes';

import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { ComponentProps, useState } from 'react';
import { twMerge } from 'tailwind-merge';

const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
    event.preventDefault(); // always add prevent default for onSubmit action

    setIsLoading(true);
    const formData = new FormData(event.currentTarget);

    const email = formData.get('email');
    const password = formData.get('password');

    const results = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsLoading(false);
    if (!results?.ok && results?.error) {
      setError(results.error);
    }
    if (results?.ok) {
      router.replace(AdminRoute.Dashboard);
    }
  };
  return (
    <form method="post" className="relative mt-6" onSubmit={onSubmit}>
      <Alert
        variant="vibrant"
        className={twMerge(
          'z-0 mb-2 min-h-[64px] transition-all duration-300 ease-in-out',
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
