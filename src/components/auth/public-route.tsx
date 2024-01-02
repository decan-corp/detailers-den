/* eslint-disable react/jsx-no-useless-fragment */
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';

import { getPageSession } from './get-page-session';

import { redirect } from 'next/navigation';

const PublicRoute = async ({ children }: { children: React.ReactNode }) => {
  const session = await getPageSession();

  if (session && [Role.Crew, Role.StayInCrew, Role.Cashier].includes(session?.user.role)) {
    redirect(AdminRoute.POS);
  }

  if (session) {
    redirect(AdminRoute.Dashboard);
  }

  return <>{children}</>;
};

export default PublicRoute;
