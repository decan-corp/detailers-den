'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import ToolboxIcon from 'public/icons/toolbox.svg';
import UserGroupIcon from 'public/icons/user-group.svg';
import { Role } from 'src/constants/common';
import { AdminRoute } from 'src/constants/routes';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export const SidebarNav = ({ className, role }: { className?: string; role: Role }) => {
  const pathname = usePathname() as AdminRoute;

  const sidebarNavItems = useMemo(
    () => [
      ...(role === Role.Admin
        ? [
            {
              title: 'Users',
              href: AdminRoute.ManageUsers,
              icon: UserGroupIcon,
            },
          ]
        : []),
      {
        title: 'Services',
        href: AdminRoute.ManageServices,
        icon: ToolboxIcon,
      },
      // TODO: promo
      // {
      //   title: 'Promo (WIP)',
      //   href: AdminRoute.ManagePromo,
      //   icon: ToolboxIcon,
      // },
    ],
    [role]
  );

  return (
    <nav className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)}>
      {sidebarNavItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            buttonVariants({ variant: 'ghost' }),
            pathname === item.href
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          <item.icon className="mr-2 h-4 w-4 fill-foreground" />
          {item.title}
        </Link>
      ))}
    </nav>
  );
};
