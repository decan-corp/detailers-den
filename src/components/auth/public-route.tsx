/* eslint-disable react/jsx-no-useless-fragment */
import { authOptions } from 'src/app/api/auth/[...nextauth]/route';
import { AdminRoute } from 'src/constants/routes';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

const PublicRoute = async ({
  children,
  redirectTo,
}: {
  children: React.ReactNode;
  redirectTo?: AdminRoute;
}) => {
  const session = await getServerSession(authOptions);

  if (session) {
    return redirect(redirectTo || AdminRoute.Dashboard);
  }

  return <>{children}</>;
};

export default PublicRoute;
