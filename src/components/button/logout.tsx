'use client';

import { AdminRoute } from 'src/constants/routes';

import { signOut } from 'next-auth/react';

const LogoutButton = () => (
  <button type="button" onClick={() => signOut({ callbackUrl: AdminRoute.Login })}>
    Log out
  </button>
);

export default LogoutButton;
