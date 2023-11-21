/* eslint-disable react/jsx-no-useless-fragment */
import { AdminRoute } from 'src/constants/routes';

import { getPageSession } from './get-page-session';

import { redirect } from 'next/navigation';

const PublicRoute = async ({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: AdminRoute;
}) => {
  const session = await getPageSession();

  if (session) {
    return redirect(redirectTo || AdminRoute.Dashboard);
  }

  return <>{children}</>;
};

export default PublicRoute;
