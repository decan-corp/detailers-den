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
import { forgotPassword } from 'src/actions/auth/forgot-password';
import { AdminRoute } from 'src/constants/routes';
import { handleSafeActionError } from 'src/utils/error-handling';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  email: z.string().email(),
});
type FormValues = z.input<typeof formSchema>;

const defaultValues: Partial<FormValues> = {};

const ForgotPassword = () => {
  const [showSuccess, setShowSuccess] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    shouldFocusError: true,
    defaultValues,
  });

  const { mutate: mutateForgotPassword, isPending } = useMutation({
    mutationFn: forgotPassword,
    onSuccess: (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        return;
      }

      toast.success('Email sent!');
      setShowSuccess(true);
    },
  });

  const onSubmit = (event: FormValues) => {
    mutateForgotPassword(event);
  };

  return (
    <div className="flex h-screen items-center justify-center p-8">
      {showSuccess ? (
        <div className="w-[420px]">
          <div className="text-center text-2xl font-semibold">Password Reset Email Sent</div>
          <div className="mt-6 text-center text-muted-foreground">
            Check your inbox for instructions on resetting your password. If you don&apos;t see the
            email, please check your spam folder.
          </div>
        </div>
      ) : (
        <Card className="w-full max-w-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardHeader className="space-y-1">
                <CardTitle className="text-center text-2xl">Forgot Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your email below to reset your password. We&apos;ll send you a secure link
                  to reset it.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button type="submit" className="w-full" disabled={isPending}>
                  {isPending && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
                  Submit
                </Button>
                <div className="mt-2 w-full text-center">
                  <Link
                    className="text-sm text-muted-foreground underline hover:brightness-125"
                    href={AdminRoute.Login}
                  >
                    Back to login
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ForgotPassword;
