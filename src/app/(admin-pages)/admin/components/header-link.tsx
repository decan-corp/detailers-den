'use client';

import { AdminRoute, Route } from 'src/constants/routes';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

const HeaderLink = ({
  route,
  children,
  className,
}: {
  className?: string;
  route: AdminRoute | Route;
  children: ReactNode;
}) => {
  const pathname = usePathname() as AdminRoute | Route;
  const isPathnameMatch = pathname.startsWith(route) && route !== AdminRoute.Dashboard;
  const isHomePathname = route === AdminRoute.Dashboard && pathname === AdminRoute.Dashboard;
  return (
    <Link
      href={route}
      className={twMerge(
        'text-sm font-medium text-muted-foreground transition-colors hover:text-primary',
        (isPathnameMatch || isHomePathname) && 'font-bold text-primary',
        className
      )}
    >
      {children}
    </Link>
  );
};

export default HeaderLink;
