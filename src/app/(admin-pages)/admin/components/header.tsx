import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { validateRequest } from 'src/components/auth/validate-request';
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';

import HeaderLink from './header-link';
import UserNav from './user-nav';

import { AlignJustifyIcon } from 'lucide-react';
import Link from 'next/link';

const Header = async () => {
  const { session, user } = await validateRequest();

  if (!session) {
    return null;
  }

  return (
    <div className="sticky top-0 z-10 select-none border-b">
      <div className="flex h-12 items-center justify-between gap-12 bg-background/30 px-6 backdrop-blur sm:h-16 md:justify-normal md:px-12">
        <Drawer>
          <DrawerTrigger asChild className="block sm:hidden">
            <AlignJustifyIcon />
          </DrawerTrigger>
          <DrawerContent className="space-y-6 pb-6 text-center">
            {[Role.Admin].includes(user.role) && (
              <HeaderLink className="text-2xl" route={AdminRoute.Dashboard}>
                <DrawerClose>Dashboard</DrawerClose>
              </HeaderLink>
            )}
            {[Role.Admin].includes(user.role) && (
              <HeaderLink className="text-2xl" route={AdminRoute.ManageUsers}>
                <DrawerClose>Manage</DrawerClose>
              </HeaderLink>
            )}
            <HeaderLink className="text-2xl" route={AdminRoute.POS}>
              <DrawerClose>POS</DrawerClose>
            </HeaderLink>
          </DrawerContent>
        </Drawer>
        <div className="text-sm font-bold md:text-base">
          <Link href={AdminRoute.Dashboard}>185 Detailers Den</Link>
        </div>
        <nav className="hidden items-center space-x-4 sm:flex lg:space-x-6">
          {[Role.Admin].includes(user.role) && (
            <HeaderLink route={AdminRoute.Dashboard}>Dashboard</HeaderLink>
          )}
          {[Role.Admin].includes(user.role) && (
            <HeaderLink route={AdminRoute.ManageUsers}>Manage</HeaderLink>
          )}
          <HeaderLink route={AdminRoute.POS}>POS</HeaderLink>
        </nav>
        <div className="md:ml-auto">
          <UserNav />
        </div>
      </div>
    </div>
  );
};

export default Header;
