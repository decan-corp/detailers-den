/* eslint-disable no-restricted-syntax */

'use client';

import { Button } from '@/components/ui/button';
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
import { changePassword } from 'src/actions/auth/change-password';
import { AdminRoute } from 'src/constants/routes';
import { changePasswordSchema } from 'src/schemas/auth';
import { handleSafeActionError } from 'src/utils/error-handling';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = changePasswordSchema;
type FormValues = z.input<typeof formSchema>;

const ChangePasswordForm = () => {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    shouldFocusError: true,
  });

  const { mutate: mutateChangePassword, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);

        if (result.serverError === 'Incorrect current password') {
          form.setError('currentPassword', { type: 'validate', message: result.serverError });
        }
        return;
      }

      const element = document.getElementById('change-password-form') as HTMLFormElement;
      element.reset();

      toast.success('Password changed successfully.');

      setTimeout(() => {
        router.replace(AdminRoute.Login);
      }, 1000);
    },
  });

  const onSubmit = (event: FormValues) => {
    mutateChangePassword(event);
  };

  return (
    <Form {...form}>
      <form id="change-password-form" className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
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
        <Button type="submit" disabled={isPending}>
          {isPending && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
          Change Password
        </Button>
      </form>
    </Form>
  );
};

export default ChangePasswordForm;
