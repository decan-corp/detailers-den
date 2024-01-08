'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { resetPassword, verifyResetPasswordToken } from 'src/actions/auth/reset-password';
import RequiredIndicator from 'src/components/form/required-indicator';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import { handleSafeActionError } from 'src/utils/error-handling';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ComponentProps, useState } from 'react';
import { toast } from 'sonner';
import { twJoin } from 'tailwind-merge';

type ValidationError = Partial<Parameters<typeof resetPassword>[number]>;

const ForgotPassword = ({ params }: { params: { resetPasswordTokenId: string } }) => {
  const { resetPasswordTokenId } = params;
  const router = useRouter();
  const [error, setError] = useState<ValidationError>({});

  const { error: tokenErrorMessage, isLoading } = useQuery({
    queryKey: [Entity.ResetPasswordTokens, resetPasswordTokenId],
    queryFn: async () => {
      const { data, serverError, validationError } = await verifyResetPasswordToken({
        resetPasswordTokenId,
      });

      if (serverError) throw new Error(serverError);
      if (validationError) throw new Error('Invalid reset token format');
      return data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { mutate: mutateResetPassword, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (result) => {
      if (result.validationError || result.serverError) {
        handleSafeActionError(result);
        setError((result.validationError as ValidationError) || {});
        return;
      }

      toast.success('Password changed successfully!');

      setTimeout(() => {
        router.replace(AdminRoute.Login);
      }, 2000);
    },
  });

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    setError({});

    const formData = new FormData(event.currentTarget);

    mutateResetPassword({
      resetPasswordTokenId,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-ring loading-lg text-foreground" />
      </div>
    );
  }

  if (tokenErrorMessage) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <Alert
          variant="vibrant"
          className="pointer-events-none z-0 mb-2 min-h-[64px] w-80 text-center"
        >
          <AlertTitle>Oops! Something went wrong.</AlertTitle>
          <AlertDescription>{tokenErrorMessage.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <form onSubmit={onSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
            <CardDescription className="text-center">
              You&apos;re almost there! Enter your new password below to regain access to your
              account. Choose a strong and secure password to keep your account safe.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label className="flex" htmlFor="password">
                Password <RequiredIndicator />
              </Label>
              <Input id="password" name="password" type="password" required minLength={6} />
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
            <Button type="submit" className="w-full" disabled={isPending}>
              Submit
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
