import { getPageSession } from 'src/components/auth/get-page-session';
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';

import HeaderLink from './header-link';
import UserNav from './user-nav';

import Link from 'next/link';

const Header = async () => {
  const session = await getPageSession();

  if (!session) {
    return null;
  }

  return (
    <div className="sticky top-0 select-none border-b">
      <div className="flex h-16 items-center gap-12 bg-background/30 px-6 backdrop-blur md:px-12">
        <div className="text-sm font-bold md:text-base">
          <Link href={AdminRoute.Dashboard}>185 Detailers Den</Link>
        </div>
        <nav className="flex items-center space-x-4 lg:space-x-6">
          {[Role.Admin].includes(session?.user.role) && (
            <HeaderLink route={AdminRoute.Dashboard}>Dashboard</HeaderLink>
          )}
          {[Role.Admin].includes(session.user.role) && (
            <HeaderLink route={AdminRoute.ManageUsers}>Manage</HeaderLink>
          )}
          <HeaderLink route={AdminRoute.POS}>POS</HeaderLink>
        </nav>
        <div className="ml-auto">
          <UserNav />
        </div>
      </div>
    </div>
  );
};

export default Header;
