/* eslint-disable no-alert */

'use client';

import { Icons } from '@/components/ui/icons';
import { logout } from 'src/actions/auth/logout';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

const LogoutButton = ({ className }: { className?: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const onClickLogout = async () => {
    setIsLoading(true);

    await queryClient.resetQueries();
    const result = await logout({});

    if (result?.serverError) {
      toast.error('Server Error', {
        description: result.serverError,
      });
      return;
    }
    setIsLoading(false);
  };
  return (
    <button
      className={twMerge(
        'flex w-full items-center disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
      type="button"
      onClick={onClickLogout}
      disabled={isLoading}
    >
      {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
      Log out
    </button>
  );
};

export default LogoutButton;
