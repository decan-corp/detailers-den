import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TabsContent } from '@/components/ui/tabs';
import PesoSignIcon from 'public/icons/peso-sign.svg';
import ReceiptIcon from 'public/icons/receipt.svg';
import { getTotalRevenue } from 'src/actions/transactions/get-total-revenue';
import { getTotalTransactionCount } from 'src/actions/transactions/get-total-transactions-count';
import {
  DateRangePickerWithPresets,
  StringDateRange,
} from 'src/components/input/date-range-picker-with-presets';
import { Entity } from 'src/constants/entities';
import { DATE_RANGE_OPTIONS } from 'src/constants/options';
import { formatAmount } from 'src/utils/format';

import AvailedServiceCount from '../common/availed-service-count';
import TransactionsCountChart from '../common/overview-chart';
import VehicleSizeCount from '../common/vehicle-size-count';
import { DashboardTab } from '../tabs-container';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useState } from 'react';

const initialDate = {
  from: dayjs().startOf('month').toISOString(),
  to: dayjs().endOf('month').toISOString(),
};

const TransactionsTab = () => {
  const [date, setDate] = useState<StringDateRange | undefined>(initialDate);
  const { data: currentMonthRevenue, isLoading: isLoadingCurrentMonthRevenue } = useQuery({
    queryKey: [Entity.Metrics, Entity.Transactions, 'revenue', date],
    queryFn: async () => {
      if (!date?.from || !date.to) {
        return {
          currentRevenue: 0,
        };
      }

      const { data } = await getTotalRevenue({
        current: {
          startDate: date?.from,
          endDate: date.to,
        },
      });
      return data;
    },
    enabled: !!date?.from && !!date?.to,
  });

  const { data: transactionsCount, isLoading: isLoadingCurrentMonthTransactionsCount } = useQuery({
    queryKey: [Entity.Metrics, Entity.Transactions, 'count', date],
    queryFn: async () => {
      if (!date?.from || !date.to) {
        return {
          currentCount: 0,
        };
      }
      const { data } = await getTotalTransactionCount({
        current: {
          startDate: date?.from,
          endDate: date.to,
        },
      });
      return data;
    },
    enabled: !!date?.from && !!date?.to,
  });
  return (
    <TabsContent value={DashboardTab.Transactions} className="space-y-4">
      <div>
        <DateRangePickerWithPresets
          mode="string"
          initialDateRange={date}
          onChange={setDate}
          options={DATE_RANGE_OPTIONS}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Computed Revenue</CardTitle>
            <PesoSignIcon className="h-4 w-4 [&>path]:fill-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingCurrentMonthRevenue ? (
              <Skeleton className="h-8" />
            ) : (
              <div className="text-2xl font-bold">
                {formatAmount(currentMonthRevenue?.currentRevenue ?? 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions Count</CardTitle>
            <ReceiptIcon className="h-4 w-4 [&>path]:fill-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingCurrentMonthTransactionsCount ? (
              <Skeleton className="h-8" />
            ) : (
              <div className="text-2xl font-bold">+{transactionsCount?.currentCount}</div>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Number of transactions based on provided date range.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <TransactionsCountChart startDate={date?.from} endDate={date?.to} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Number of Availed Services</CardTitle>
            <CardDescription>
              Count for each availed services for the given date range.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {date?.from && date?.to ? (
              <AvailedServiceCount startDate={date.from} endDate={date.to} />
            ) : (
              <div className="py-12 text-center text-muted-foreground">Select date range first</div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Vehicle Size Count</CardTitle>
            <CardDescription>
              Count of vehicles of each size that have been serviced within a specified date range
            </CardDescription>
          </CardHeader>
          <CardContent>
            {date?.from && date?.to ? (
              <VehicleSizeCount startDate={date.from} endDate={date.to} />
            ) : (
              <div className="py-12 text-center text-muted-foreground">Select date range first</div>
            )}
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default TransactionsTab;
