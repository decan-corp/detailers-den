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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { resetPassword, verifyResetPasswordToken } from 'src/actions/auth/reset-password';
import { Entity } from 'src/constants/entities';
import { AdminRoute } from 'src/constants/routes';
import { resetPasswordSchema } from 'src/schemas/auth';
import { handleSafeActionError } from 'src/utils/error-handling';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = resetPasswordSchema;
type FormValues = z.input<typeof formSchema>;

const ForgotPassword = ({ params }: { params: { resetPasswordTokenId: string } }) => {
  const { resetPasswordTokenId } = params;
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    shouldFocusError: true,
    defaultValues: {
      resetPasswordTokenId,
    },
  });

  const { error: tokenErrorMessage, isLoading } = useQuery({
    queryKey: [Entity.ResetPasswordTokens, resetPasswordTokenId],
    queryFn: async () => {
      const { data, serverError, validationErrors } = await verifyResetPasswordToken({
        resetPasswordTokenId,
      });

      if (serverError) throw new Error(serverError);
      if (validationErrors) throw new Error('Invalid reset token format');
      return data;
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { mutate: mutateResetPassword, isPending } = useMutation({
    mutationFn: resetPassword,
    onSuccess: (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      toast.success('Password changed successfully!');

      setTimeout(() => {
        router.replace(AdminRoute.Login);
      }, 1000);
    },
  });

  const onSubmit = (event: FormValues) => {
    mutateResetPassword({
      ...event,
      resetPasswordTokenId,
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
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader className="space-y-1">
              <CardTitle className="text-center text-2xl">Reset Password</CardTitle>
              <CardDescription className="text-center">
                You&apos;re almost there! Enter your new password below to regain access to your
                account. Choose a strong and secure password to keep your account safe.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isPending}>
                {isPending && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                Submit
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
