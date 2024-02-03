/* eslint-disable react/jsx-no-useless-fragment */
import { validateRequest } from 'src/components/auth/validate-request';
import { AdminRoute } from 'src/constants/routes';

import { redirect } from 'next/navigation';

const AccountSetupLayout = async ({ children }: { children: React.ReactNode }) => {
  const { session } = await validateRequest();

  if (!session) {
    return redirect(AdminRoute.Login);
  }

  return <>{children}</>;
};

export default AccountSetupLayout;
