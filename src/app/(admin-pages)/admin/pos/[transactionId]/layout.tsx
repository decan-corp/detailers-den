import { getPageSession } from 'src/components/auth/get-page-session';
import { Role } from 'src/constants/common';

import { notFound } from 'next/navigation';
import { ReactNode } from 'react';

const ViewTransactionLayout = async ({ children }: { children: ReactNode }) => {
  const session = await getPageSession();

  if (session?.user.role !== Role.Admin) {
    notFound();
  }

  return <div>{children}</div>;
};

export default ViewTransactionLayout;
