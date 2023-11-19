'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSetParams from 'src/hooks/use-set-params';

import AnalyticsTabContent from './components/analytics-tab-content';
import OverviewTabContent from './components/overview-tab-content';

import { useSearchParams } from 'next/navigation';

export enum DashboardTab {
  Overview = 'overview',
  Analytics = 'analytics',
  Reports = 'reports',
}
export enum DashboardParam {
  Tab = 'tab',
}

const Home = () => {
  const searchParams = useSearchParams();
  const setParams = useSetParams<DashboardParam>();

  const tab = searchParams.get(DashboardParam.Tab);

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs value={tab || DashboardTab.Overview} className="space-y-4">
        <TabsList>
          <TabsTrigger
            onClick={() => setParams(DashboardParam.Tab, DashboardTab.Overview)}
            value={DashboardTab.Overview}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger
            onClick={() => setParams(DashboardParam.Tab, DashboardTab.Analytics)}
            value={DashboardTab.Analytics}
          >
            Analytics (WIP)
          </TabsTrigger>
          <TabsTrigger value={DashboardTab.Reports} disabled>
            Reports (WIP)
          </TabsTrigger>
        </TabsList>
        <OverviewTabContent />
        <AnalyticsTabContent />
      </Tabs>
    </main>
  );
};

export default Home;
