import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';

import { DashboardTab } from '../page';

const AnalyticsTabContent = () => (
  <TabsContent value={DashboardTab.Analytics} className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Analytics</CardTitle>
          <CardDescription>WIP</CardDescription>
        </CardHeader>
        <CardContent className="">WIP</CardContent>
      </Card>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Services</CardTitle>
          <CardDescription>Services rank by number of transactions</CardDescription>
        </CardHeader>
        <CardContent>WIP</CardContent>
      </Card>
    </div>
  </TabsContent>
);

export default AnalyticsTabContent;
