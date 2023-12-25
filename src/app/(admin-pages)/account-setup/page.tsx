'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { setupPassword } from 'src/actions/auth/change-password';
import RequiredIndicator from 'src/components/form/required-indicator';
import { AdminRoute } from 'src/constants/routes';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ComponentProps, useState } from 'react';
import { twJoin } from 'tailwind-merge';

type ValidationError = Partial<Parameters<typeof setupPassword>[number]>;

const AccountSetup = () => {
  const router = useRouter();
  const [error, setError] = useState<ValidationError>({});
  const {
    mutate: mutateSetupPassword,
    isPending,
    isSuccess,
  } = useMutation({
    mutationFn: setupPassword,
    onSuccess: (result) => {
      if (result.validationError) {
        toast({
          title: 'Invalid Input',
          description:
            'Please check your input fields for errors. Ensure all required fields are filled correctly and try again.',
          variant: 'destructive',
        });

        setError(result.validationError as ValidationError);
        return;
      }

      if (result?.serverError) {
        toast({
          title: 'Something went wrong',
          description: result.serverError,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Success!',
        description: 'Account secured successfully!',
      });

      setTimeout(() => {
        router.replace(AdminRoute.Login);
      }, 2000);
    },
  });

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    setError({});

    const formData = new FormData(event.currentTarget);

    mutateSetupPassword({
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    });
  };

  return (
    <div className="flex h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <form onSubmit={onSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Secure Your Account</CardTitle>
            <CardDescription className="text-center">
              Create a strong password to protect your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label className="flex" htmlFor="password">
                Password <RequiredIndicator />
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                disabled={isSuccess}
              />
            </div>
            <div>
              <div className="grid gap-2">
                <Label className="flex" htmlFor="confirmPassword">
                  Confirm Password <RequiredIndicator />
                </Label>
                <Input
                  className={twJoin(error.confirmPassword && 'border-destructive-200')}
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={6}
                  disabled={isSuccess}
                />
              </div>
              {error.confirmPassword && (
                <div className="text-sm text-destructive dark:text-destructive-200">
                  {error.confirmPassword}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isPending || isSuccess}>
              Submit
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default AccountSetup;
