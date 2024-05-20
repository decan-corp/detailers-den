'use client';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerClose, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSetParams from 'src/hooks/use-set-params';

import AnalyticsTab from './analytics-tab';
import CrewEarningsTab from './crew-earnings-tab';
import OverviewTab from './overview-tab';
import TransactionsTab from './transactions-tab';

import { MenuIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';
import { twJoin } from 'tailwind-merge';

export enum DashboardTab {
  Overview = 'overview',
  Analytics = 'analytics',
  CrewEarnings = 'crew-earnings',
  Transactions = 'transactions',
}
export enum DashboardParam {
  Tab = 'tab',
}

export const tabsList = [
  {
    label: 'Overview',
    value: DashboardTab.Overview,
  },
  {
    label: 'Crew Earnings',
    value: DashboardTab.CrewEarnings,
  },
  {
    label: 'Transactions',
    value: DashboardTab.Transactions,
  },
  {
    label: 'Analytics (WIP)',
    value: DashboardTab.Analytics,
    disabled: true,
  },
] satisfies { label: string; value: DashboardTab; disabled?: boolean }[];

const TabsContainer = () => {
  const searchParams = useSearchParams();
  const setParams = useSetParams<DashboardParam>();

  const tab = searchParams.get(DashboardParam.Tab);

  const selectedTab = useMemo(
    () => tabsList.find(({ value }) => value === tab) || tabsList[0],
    [tab]
  );

  return (
    <Tabs value={tab || DashboardTab.Overview} className="space-y-4">
      <Drawer>
        <DrawerTrigger asChild className="block w-full sm:hidden">
          <Button className="flex gap-2 font-bold" variant="outline">
            <MenuIcon className="size-4" />
            {selectedTab?.label}
          </Button>
        </DrawerTrigger>
        <DrawerContent className="space-y-6 pb-6 text-center">
          {tabsList.map(({ value, label, disabled }) => (
            <Button
              asChild
              key={value}
              className={twJoin(
                'text-2xl font-medium text-muted-foreground transition-colors hover:text-primary hover:no-underline',
                value === selectedTab.value && 'font-bold text-primary'
              )}
              variant="link"
              disabled={disabled}
              onClick={() => setParams(DashboardParam.Tab, value)}
            >
              <DrawerClose>{label}</DrawerClose>
            </Button>
          ))}
        </DrawerContent>
      </Drawer>

      <TabsList className="hidden sm:flex sm:w-fit">
        {tabsList.map(({ label, value, disabled }) => (
          <TabsTrigger
            key={value}
            value={value}
            disabled={disabled}
            onClick={() => setParams(DashboardParam.Tab, value)}
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>

      <OverviewTab />
      <CrewEarningsTab />
      <AnalyticsTab />
      <TransactionsTab />
    </Tabs>
  );
};

export default TabsContainer;
