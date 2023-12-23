import { Separator } from '@/components/ui/separator';

import { SidebarNav } from './components/sidebar-nav';

import { Metadata } from 'next';
import { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Management',
};

const Management = ({ children }: { children: ReactNode }) => (
  <div className="space-y-6 bg-background p-10 pb-16">
    <div className="space-y-0.5">
      <h2 className="text-2xl font-bold tracking-tight">Management</h2>
      <p className="text-muted-foreground">Manage your business here.</p>
    </div>
    <Separator className="my-6" />
    <div className="space-y-6 lg:grid lg:grid-cols-6 lg:gap-x-12 lg:gap-y-8 lg:space-y-0">
      <aside className="w-full max-w-[300px] lg:col-span-1">
        <SidebarNav />
      </aside>
      <div className="max-w-[1600px] lg:col-span-5">{children}</div>
    </div>
  </div>
);

export default Management;
