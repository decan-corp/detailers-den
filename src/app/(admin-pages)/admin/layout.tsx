import '../../globals.css';

import { authOptions } from 'src/app/api/auth/[...nextauth]/route';
import { AdminRoute } from 'src/constants/routes';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

export const metadata: Metadata = {
  title: 'Admin',
};

const AdminLayout = async ({ children }: { children: React.ReactNode }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return redirect(AdminRoute.Login);
  }

  return <div>{children}</div>;
};

export default AdminLayout;
