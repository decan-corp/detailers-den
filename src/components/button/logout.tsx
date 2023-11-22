/* eslint-disable no-alert */

'use client';

import { Icons } from '@/components/ui/icons';
import { logout } from 'src/app/(admin-pages)/auth/login/actions';

import { useState } from 'react';
import { twMerge } from 'tailwind-merge';

const LogoutButton = ({ className }: { className?: string }) => {
  const [isLoading, setIsLoading] = useState(false);
  const onClickLogout = async () => {
    setIsLoading(true);

    const result = await logout({});

    if (result?.serverError) {
      alert(result?.serverError); // TODO: replace with react toast
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
