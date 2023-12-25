/* eslint-disable react/jsx-no-useless-fragment */
import { getPageSession } from 'src/components/auth/get-page-session';
import { AdminRoute } from 'src/constants/routes';

import { redirect } from 'next/navigation';

const AccountSettingsLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getPageSession();

  if (!session) {
    return redirect(AdminRoute.Login);
  }

  return <>{children}</>;
};

export default AccountSettingsLayout;
