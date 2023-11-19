import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';

import { DashboardTab } from '../page';

const AnalyticsTabContent = () => (
  <TabsContent value={DashboardTab.Analytics} className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>WIP</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">{/* <Overview /> */}</CardContent>
      </Card>
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <CardDescription>WIP</CardDescription>
        </CardHeader>
        <CardContent>{/* <RecentSales /> */}</CardContent>
      </Card>
    </div>
  </TabsContent>
);

export default AnalyticsTabContent;
