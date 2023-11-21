/* eslint-disable no-alert */

'use client';

import { Icons } from '@/components/ui/icons';
import { logout } from 'src/app/(admin-pages)/auth/login/actions';

import { useState } from 'react';

const LogoutButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const onClickLogout = async () => {
    setIsLoading(true);

    const { serverError } = await logout({});

    if (serverError) {
      alert(serverError); // TODO: replace with react toast
      return;
    }
    setIsLoading(false);
  };
  return (
    <button type="button" onClick={onClickLogout} disabled={isLoading}>
      {isLoading && <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />}
      Log out
    </button>
  );
};

export default LogoutButton;
