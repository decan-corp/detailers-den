/* eslint-disable react/jsx-no-useless-fragment */

import { AdminRoute } from 'src/constants/routes';

import { validateRequest } from './validate-request';

import { redirect } from 'next/navigation';

const ProtectedRoute = async ({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: AdminRoute;
}) => {
  const { user } = await validateRequest();

  if (!user) {
    redirect(redirectTo || AdminRoute.Login);
  }

  if (user?.isFirstTimeLogin) {
    redirect(AdminRoute.AccountSetup);
  }

  return <>{children}</>;
};

export default ProtectedRoute;
