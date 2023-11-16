import '../../globals.css';

import { authOptions } from 'src/app/api/auth/[...nextauth]/route';
import { AdminRoute } from 'src/constants/routes';

import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

const AuthLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (session) {
    return redirect(AdminRoute.Home);
  }

  return <div>{children}</div>;
};

export default AuthLayout;
