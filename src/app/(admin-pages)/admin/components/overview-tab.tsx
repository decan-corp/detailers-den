import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TabsContent } from '@/components/ui/tabs';
import PesoSignIcon from 'public/icons/peso-sign.svg';
import ReceiptIcon from 'public/icons/receipt.svg';
import { getCurrentMonthRevenue } from 'src/actions/transactions/get-current-month-revenue';
import { getCurrentMonthTransactionsCount } from 'src/actions/transactions/get-current-month-transactions-count';
import { Entity } from 'src/constants/entities';

import CrewTransactions from './employee-transactions';
import OverviewChart from './overview-chart';
import { DashboardTab } from './tabs-container';

import { useQuery } from '@tanstack/react-query';

const OverviewTab = () => {
  const { data: currentMonthRevenue, isLoading: isLoadingCurrentMonthRevenue } = useQuery({
    queryKey: [Entity.Transactions, 'monthly-revenue'],
    queryFn: async () => {
      const { data } = await getCurrentMonthRevenue({});
      return data;
    },
  });

  const { data: currentMonthTransactionsCount, isLoading: isLoadingCurrentMonthTransactionsCount } =
    useQuery({
      queryKey: [Entity.Transactions, 'monthly-transactions-count'],
      queryFn: async () => {
        const { data } = await getCurrentMonthTransactionsCount({});
        return data;
      },
    });

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
              <div className="text-2xl font-bold">Php {currentMonthRevenue?.currentMonth ?? 0}</div>
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
                +{currentMonthTransactionsCount?.currentMonth}
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
            <div className="text-2xl font-bold">Php 345,231.89</div>
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
            <div className="text-2xl font-bold">+573</div>
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
            <OverviewChart />
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
            <CrewTransactions />
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
};

export default OverviewTab;
