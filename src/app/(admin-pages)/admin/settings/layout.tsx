import { Separator } from '@/components/ui/separator';

import SettingsSidebarNav from './components/sidebar-nav';

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const SettingsLayout = ({ children }: SettingsLayoutProps) => (
  <div className="space-y-6 p-10 pb-16">
    <div className="space-y-0.5">
      <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      <p className="text-muted-foreground">Manage your account settings here.</p>
    </div>
    <Separator className="my-6" />
    <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
      <aside className="-mx-4 lg:w-1/5">
        <SettingsSidebarNav />
      </aside>
      <div className="flex-1 lg:max-w-2xl">{children}</div>
    </div>
  </div>
);

export default SettingsLayout;
