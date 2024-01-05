import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TabsContent } from '@/components/ui/tabs';
import { DateRangePickerWithPresets } from 'src/components/input/date-range-picker-with-presets';
import { DATE_RANGE_OPTIONS } from 'src/constants/options';

import CrewTransactions from '../common/crew-transactions';
import { DashboardTab } from '../tabs-container';

import dayjs from 'dayjs';
import { useState } from 'react';
import { DateRange } from 'react-day-picker';

// TODO: add filters for crew, date range and frequency (daily, weekly monthly)
// TODO: replace list type of card content with charts

const initialDate = {
  from: dayjs().day(-2).startOf('day').toDate(),
  to: dayjs().day(4).endOf('day').toDate(),
};

const CrewEarningsTab = () => {
  const [date, setDate] = useState<DateRange | undefined>(initialDate);

  return (
    <TabsContent value={DashboardTab.CrewEarnings} className="space-y-4">
      <div>
        <DateRangePickerWithPresets
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
