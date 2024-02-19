import { Separator } from '@/components/ui/separator';
import { validateRequest } from 'src/components/auth/validate-request';

import { SidebarNav } from './components/sidebar-nav';

import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Manage',
};

const Management = async ({ children }: { children: ReactNode }) => {
  const { user } = await validateRequest();

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="space-y-6 bg-background p-4 pb-16 sm:p-10">
      <div className="space-y-0.5">
        <h2 className="text-2xl font-bold tracking-tight">Management</h2>
        <p className="text-muted-foreground">Manage your business here.</p>
      </div>
      <Separator className="my-6" />
      <div className="space-y-6 lg:grid lg:grid-cols-6 lg:gap-x-12 lg:gap-y-8 lg:space-y-0">
        <aside className="w-full max-w-[300px] lg:col-span-1">
          <SidebarNav role={user.role} />
        </aside>
        <div className="max-w-[1600px] lg:col-span-5">{children}</div>
      </div>
    </div>
  );
};

export default Management;
