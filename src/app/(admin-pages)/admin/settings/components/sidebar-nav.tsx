/* eslint-disable react/jsx-props-no-spreading */

'use client';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AdminRoute } from 'src/constants/routes';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {}

const sidebarNavItems = [
  {
    title: 'Profile',
    href: AdminRoute.Settings,
  },
  {
    title: 'Change Password',
    href: AdminRoute.ChangePassword,
  },
];

const SettingsSidebarNav = ({ className, ...props }: SidebarNavProps) => {
  const pathname = usePathname() as AdminRoute;

  return (
    <nav
      className={cn('flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1', className)}
      {...props}
    >
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
          {item.title}
        </Link>
      ))}
    </nav>
  );
};

export default SettingsSidebarNav;
