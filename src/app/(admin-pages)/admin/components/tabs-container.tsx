'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSetParams from 'src/hooks/use-set-params';

import AnalyticsTab from './analytics-tab';
import CrewEarningsTab from './crew-earnings-tab';
import OverviewTab from './overview-tab';
import TransactionsTab from './transactions-tab';

import { useSearchParams } from 'next/navigation';

export enum DashboardTab {
  Overview = 'overview',
  Analytics = 'analytics',
  CrewEarnings = 'crew-earnings',
  Transactions = 'transactions',
}
export enum DashboardParam {
  Tab = 'tab',
}

const TabsContainer = () => {
  const searchParams = useSearchParams();
  const setParams = useSetParams<DashboardParam>();

  const tab = searchParams.get(DashboardParam.Tab);

  return (
    <Tabs value={tab || DashboardTab.Overview} className="space-y-4">
      <TabsList className="grid h-full grid-cols-2 gap-y-2 sm:flex sm:w-fit">
        <TabsTrigger
          value={DashboardTab.Overview}
          onClick={() => setParams(DashboardParam.Tab, DashboardTab.Overview)}
        >
          Overview
        </TabsTrigger>
        <TabsTrigger
          value={DashboardTab.CrewEarnings}
          onClick={() => setParams(DashboardParam.Tab, DashboardTab.CrewEarnings)}
        >
          Crew Earnings
        </TabsTrigger>
        <TabsTrigger
          value={DashboardTab.Transactions}
          onClick={() => setParams(DashboardParam.Tab, DashboardTab.Transactions)}
        >
          Transactions
        </TabsTrigger>
        <TabsTrigger
          value={DashboardTab.Analytics}
          onClick={() => setParams(DashboardParam.Tab, DashboardTab.Analytics)}
          disabled
        >
          Analytics (WIP)
        </TabsTrigger>
      </TabsList>
      <OverviewTab />
      <CrewEarningsTab />
      <AnalyticsTab />
      <TransactionsTab />
    </Tabs>
  );
};

export default TabsContainer;
