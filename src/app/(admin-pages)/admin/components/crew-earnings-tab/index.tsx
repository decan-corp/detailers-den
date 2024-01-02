import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';

import CrewTransactions from '../common/crew-transactions';
import { DashboardTab } from '../tabs-container';

import dayjs from 'dayjs';

// TODO: add filters for crew, date range and frequency (daily, weekly monthly)
// TODO: replace list type of card content with charts

const CrewEarningsTab = () => (
  <TabsContent value={DashboardTab.CrewEarnings} className="space-y-4">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Weekly Crew Earnings</CardTitle>
          <CardDescription>Records displayed monthly in descending order.</CardDescription>
        </CardHeader>
        <CardContent>
          <CrewTransactions
            startDate={dayjs().startOf('week').toDate()}
            endDate={dayjs().endOf('week').toDate()}
          />
        </CardContent>
      </Card>
      <Card className="col-span-4">
        <CardHeader>
          <CardTitle>Monthly Crew Earnings</CardTitle>
          <CardDescription>Records displayed weekly in descending order.</CardDescription>
        </CardHeader>
        <CardContent>
          <CrewTransactions
            startDate={dayjs().startOf('month').toDate()}
            endDate={dayjs().endOf('month').toDate()}
          />
        </CardContent>
      </Card>
    </div>
  </TabsContent>
);

export default CrewEarningsTab;
