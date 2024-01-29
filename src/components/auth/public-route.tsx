/* eslint-disable react/jsx-no-useless-fragment */
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';

import { validateRequest } from './validate-request';

import { redirect } from 'next/navigation';

const PublicRoute = async ({ children }: { children: React.ReactNode }) => {
  const { user } = await validateRequest();

  if (user && [Role.Crew, Role.StayInCrew, Role.Cashier].includes(user.role)) {
    redirect(AdminRoute.POS);
  }

  if (user) {
    redirect(AdminRoute.Dashboard);
  }

  return <>{children}</>;
};

export default PublicRoute;
