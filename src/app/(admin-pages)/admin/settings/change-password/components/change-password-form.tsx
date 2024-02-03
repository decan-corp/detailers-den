/* eslint-disable no-restricted-syntax */

'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { changePassword } from 'src/actions/auth/change-password';
import RequiredIndicator from 'src/components/form/required-indicator';
import { AdminRoute } from 'src/constants/routes';
import { handleSafeActionError } from 'src/utils/error-handling';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ComponentProps, useState } from 'react';
import { toast } from 'sonner';
import { twJoin } from 'tailwind-merge';

type ValidationError = Partial<Parameters<typeof changePassword>[number]>;

const ChangePasswordForm = () => {
  const router = useRouter();
  const [error, setError] = useState<ValidationError>({});

  const { mutate: mutateChangePassword, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: (result) => {
      if (result.validationErrors || result.serverError) {
        handleSafeActionError(result);
        setError((result.validationErrors as ValidationError) || {});
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

  const onSubmit: ComponentProps<'form'>['onSubmit'] = (event) => {
    event.preventDefault();

    setError({});

    const formData = new FormData(event.currentTarget);

    mutateChangePassword({
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    });
  };

  return (
    <form id="change-password-form" className="space-y-6" onSubmit={onSubmit}>
      <div>
        <div className="space-y-4">
          <Label htmlFor="currentPassword" className="flex">
            Current Password <RequiredIndicator />
          </Label>
          <Input
            className={twJoin(error.currentPassword && 'border-destructive-200')}
            type="password"
            id="currentPassword"
            name="currentPassword"
            required
            minLength={1}
          />
        </div>
        {error.currentPassword && (
          <div className="text-sm text-destructive dark:text-destructive-200">
            {error.currentPassword}
          </div>
        )}
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
            minLength={8}
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
            minLength={8}
          />
        </div>
        {error.confirmPassword && (
          <div className="text-sm text-destructive dark:text-destructive-200">
            {error.confirmPassword}
          </div>
        )}
      </div>

      <Button type="submit" disabled={isPending}>
        Change Password
      </Button>
    </form>
  );
};

export default ChangePasswordForm;
