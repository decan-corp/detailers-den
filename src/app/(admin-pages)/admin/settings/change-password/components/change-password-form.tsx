/* eslint-disable no-restricted-syntax */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { changePassword } from 'src/actions/auth/change-password';
import RequiredIndicator from 'src/components/form/required-indicator';

import { useMutation } from '@tanstack/react-query';
import { ComponentProps, useState } from 'react';
import { twJoin } from 'tailwind-merge';

type ValidationError = Partial<Parameters<typeof changePassword>[number]>;

const ChangePasswordForm = () => {
  const [error, setError] = useState<ValidationError>({});
  const { mutateAsync: mutateChangePassword } = useMutation({
    mutationFn: changePassword,
  });
  const onSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
    event.preventDefault();

    setError({});

    const formData = new FormData(event.currentTarget);

    const result = await mutateChangePassword({
      currentPassword: String(formData.get('currentPassword')),
      newPassword: String(formData.get('newPassword')),
      confirmPassword: String(formData.get('confirmPassword')),
    });

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

    const element = document.getElementById('change-password-form') as HTMLFormElement;
    element.reset();

    toast({
      title: 'Success!',
      description: 'Password changed successfully.',
    });
  };
  return (
    <form id="change-password-form" className="space-y-6" onSubmit={onSubmit}>
      <div className="space-y-4">
        <Label htmlFor="currentPassword" className="flex">
          Current Password <RequiredIndicator />
        </Label>
        <Input type="password" id="currentPassword" name="currentPassword" required minLength={6} />
      </div>
      <div>
        <div className="space-y-4">
          <Label htmlFor="newPassword" className="flex">
            New Password <RequiredIndicator />
          </Label>
          <Input
            className={twJoin(error.newPassword && 'border-destructive-200')}
            type="password"
            id="newPassword"
            name="newPassword"
            required
            minLength={6}
          />
        </div>
        {error.newPassword && (
          <div className="text-sm text-destructive dark:text-destructive-200">
            {error.newPassword}
          </div>
        )}
      </div>
      <div>
        <div className="space-y-4">
          <Label htmlFor="confirmPassword" className="flex">
            Confirm Password <RequiredIndicator />
          </Label>
          <Input
            className={twJoin(error.confirmPassword && 'border-destructive-200')}
            type="password"
            id="confirmPassword"
            name="confirmPassword"
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

      <Button type="submit">Change Password</Button>
    </form>
  );
};

export default ChangePasswordForm;
