import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TabsContent } from '@/components/ui/tabs';
import PesoSignIcon from 'public/icons/peso-sign.svg';
import ReceiptIcon from 'public/icons/receipt.svg';
import { getTotalRevenue } from 'src/actions/transactions/get-total-revenue';
import { getTotalTransactionCount } from 'src/actions/transactions/get-total-transactions-count';
import { Entity } from 'src/constants/entities';
import { formatAmount } from 'src/utils/format';

import AvailedServiceCount from '../common/availed-service-count';
import CrewTransactions from '../common/crew-transactions';
import TransactionsCountChart from '../common/overview-chart';
import { DashboardTab } from '../tabs-container';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';

const OverviewTab = () => {
  const { data: currentMonthRevenue, isLoading: isLoadingCurrentMonthRevenue } = useQuery({
    queryKey: [Entity.Metrics, Entity.Transactions, 'monthly-revenue'],
    queryFn: async () => {
      const startDate = dayjs().startOf('month');
      const endDate = dayjs().endOf('month');
      const { data } = await getTotalRevenue({
        current: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        previous: {
          startDate: startDate.subtract(1, 'month').toISOString(),
          endDate: endDate.subtract(1, 'month').toISOString(),
        },
      });
      return data;
    },
  });

  const { data: currentMonthTransactionsCount, isLoading: isLoadingCurrentMonthTransactionsCount } =
    useQuery({
      queryKey: [Entity.Metrics, Entity.Transactions, 'monthly-transactions-count'],
      queryFn: async () => {
        const startDate = dayjs().startOf('month');
        const endDate = dayjs().endOf('month');
        const { data } = await getTotalTransactionCount({
          current: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          },
          previous: {
            startDate: startDate.subtract(1, 'month').toISOString(),
            endDate: endDate.subtract(1, 'month').toISOString(),
          },
        });
        return data;
      },
    });

  const { data: yearlyRevenue, isLoading: isLoadingYearlyRevenue } = useQuery({
    queryKey: [Entity.Metrics, Entity.Transactions, 'yearly-revenue'],
    queryFn: async () => {
      const { data } = await getTotalRevenue({
        current: {
          startDate: dayjs().startOf('year').toISOString(),
          endDate: dayjs().endOf('year').toISOString(),
        },
      });
      return data;
    },
  });

  const { data: yearlyTransactionsCount, isLoading: isLoadingYearlyTransactionsCount } = useQuery({
    queryKey: [Entity.Metrics, Entity.Transactions, 'yearly-transactions-count'],
    queryFn: async () => {
      const { data } = await getTotalTransactionCount({
        current: {
          startDate: dayjs().startOf('year').toISOString(),
          endDate: dayjs().endOf('year').toISOString(),
        },
      });
      return data;
    },
  });

  const currentWeekDateRange = useMemo(
    () => ({
      startDate: dayjs().startOf('week'),
      endDate: dayjs().endOf('week'),
    }),
    []
  );

  return (
    <TabsContent value={DashboardTab.Overview} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month Revenue</CardTitle>
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
            {isLoadingCurrentMonthRevenue ? (
              <Skeleton className="mt-1 h-3" />
            ) : (
              <p className="text-xs text-muted-foreground">
                {currentMonthRevenue?.increaseInPercentage ?? 0}% from last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month Transactions</CardTitle>
            <ReceiptIcon className="h-4 w-4 [&>path]:fill-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoadingCurrentMonthTransactionsCount ? (
              <Skeleton className="h-8" />
            ) : (
              <div className="text-2xl font-bold">
                +{currentMonthTransactionsCount?.currentCount}
              </div>
            )}
            {isLoadingCurrentMonthTransactionsCount ? (
              <Skeleton className="mt-1 h-3" />
            ) : (
              <p className="text-xs text-muted-foreground">
                {currentMonthTransactionsCount?.increaseInPercentage ?? 0}% from last month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoadingYearlyRevenue ? (
              <Skeleton className="h-8" />
            ) : (
              <div className="text-2xl font-bold">
                {formatAmount(yearlyRevenue?.currentRevenue || 0)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Transactions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            {isLoadingYearlyTransactionsCount ? (
              <Skeleton className="h-8" />
            ) : (
              <div className="text-2xl font-bold">+{yearlyTransactionsCount?.currentCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
            <CardDescription>Number of transactions for the last 14 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <TransactionsCountChart
              startDate={dayjs().subtract(13, 'days').startOf('day').toISOString()}
              endDate={dayjs().endOf('day').toISOString()}
            />
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Current Week Employee Earnings</CardTitle>
            <CardDescription>
              Total earnings of each employee for the current week (
              {currentWeekDateRange.startDate.format('MMM DD')} -{' '}
              {currentWeekDateRange.endDate.format('MMM DD')}).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CrewTransactions
              startDate={currentWeekDateRange.startDate.toISOString()}
              endDate={currentWeekDateRange.endDate.toISOString()}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Current Month Availed Services</CardTitle>
            <CardDescription>
              Count for each availed services for the current month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AvailedServiceCount
              startDate={dayjs().startOf('month').toISOString()}
              endDate={dayjs().endOf('month').toISOString()}
            />
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Current Month Employee Earnings</CardTitle>
            <CardDescription>
              Total earnings of each employee for the current month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CrewTransactions
              startDate={dayjs().startOf('month').toISOString()}
              endDate={dayjs().endOf('month').toISOString()}
            />
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default OverviewTab;
