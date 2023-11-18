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
  return (
    <Link
      href={route}
      className={twMerge(
        'text-sm  font-bold transition-colors hover:text-primary',
        pathname !== route && 'font-medium text-muted-foreground',
        className
      )}
    >
      {children}
    </Link>
  );
};

export default HeaderLink;
