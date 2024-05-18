import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import {
  DateRangePickerWithPresets,
  StringDateRange,
} from 'src/components/input/date-range-picker-with-presets';
import { DATE_RANGE_OPTIONS } from 'src/constants/options';

import CrewTransactions from '../common/crew-transactions';
import { DashboardTab } from '../tabs-container';

import dayjs from 'dayjs';
import { useState } from 'react';

const initialDate = {
  from: dayjs().startOf('week').toISOString(),
  to: dayjs().endOf('week').toISOString(),
};

const CrewEarningsTab = () => {
  const [date, setDate] = useState<StringDateRange | undefined>(initialDate);

  return (
    <TabsContent value={DashboardTab.CrewEarnings} className="space-y-4">
      <div>
        <DateRangePickerWithPresets
          mode="string"
          initialDateRange={date}
          onChange={setDate}
          options={DATE_RANGE_OPTIONS}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Crew Earnings</CardTitle>
            <CardDescription>
              Records displayed in descending order based on the selected date range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {date?.from && date?.to ? (
              <CrewTransactions startDate={date.from} endDate={date.to} />
            ) : (
              <div className="py-12 text-center text-muted-foreground">Select date range first</div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default CrewEarningsTab;
