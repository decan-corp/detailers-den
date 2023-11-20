'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import useSetParams from 'src/hooks/use-set-params';

import AnalyticsTabContent from './analytics-tab-content';
import OverviewTab from './overview-tab';

import { useSearchParams } from 'next/navigation';

export enum DashboardTab {
  Overview = 'overview',
  Analytics = 'analytics',
  Reports = 'reports',
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
      <OverviewTab />
      <AnalyticsTabContent />
    </Tabs>
  );
};

export default TabsContainer;
