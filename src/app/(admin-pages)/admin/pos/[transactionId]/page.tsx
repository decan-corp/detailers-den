'use client';

import { CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getEarningsPerService } from 'src/actions/crew-earnings/get-earnings-per-service';
import { getTransaction } from 'src/actions/transactions/get-transactions';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { notFound } from 'next/navigation';

const ViewTransaction = ({ params }: { params: { transactionId: string } }) => {
  const { data: transaction, isLoading: isTransactionsLoading } = useQuery({
    queryKey: [Entity.Transactions, params.transactionId],
    queryFn: async () => {
      const { data } = await getTransaction(params.transactionId);

      return data;
    },
    enabled: !!params.transactionId,
  });

  const { data: transactionServices, isLoading: isTransactionServicesLoading } = useQuery({
    queryKey: [Entity.CrewEarnings, params.transactionId],
    queryFn: async () => {
      const { data } = await getEarningsPerService(params.transactionId);

      return data || [];
    },
    enabled: !!params.transactionId,
  });

  const isLoading = isTransactionsLoading || isTransactionServicesLoading;

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (!transaction) {
    notFound();
  }

  return (
    <div className="space-y-32 bg-background p-4 sm:p-10 sm:px-12">
      <div className="">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Transaction Details</h2>
          <p className="text-muted-foreground">{transaction.plateNumber}</p>
        </div>
        <Separator className="my-6" />
        <div className="grid grid-cols-4 gap-20 space-y-6 sm:grid-cols-6">
          <div className="col-span-2 flex flex-col gap-7">
            <div className="space-y-2">
              <CardTitle>Customer Name</CardTitle>
              <div className="mt-2 text-muted-foreground">{transaction.customerName}</div>
            </div>

            <div className="space-y-2">
              <CardTitle>Status</CardTitle>
              <div className="mt-2 text-muted-foreground">{transaction.status}</div>
            </div>

            <div className="space-y-2">
              <CardTitle>Vehicle Size</CardTitle>
              <div className="mt-2 text-muted-foreground">{transaction.vehicleSize}</div>
            </div>

            <div className="space-y-2">
              <CardTitle>Mode of Payment</CardTitle>
              <div className="mt-2 text-muted-foreground">{transaction.modeOfPayment}</div>
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-7">
            <div className="space-y-2">
              <CardTitle>Note</CardTitle>
              <div className="mt-2 text-muted-foreground">{transaction.note}</div>
            </div>

            <div className="space-y-2">
              <CardTitle>Discount</CardTitle>
              <div className="mt-2 text-muted-foreground">{transaction.discount}</div>
            </div>

            <div className="space-y-2">
              <CardTitle>Tip</CardTitle>
              <div className="mt-2 text-muted-foreground">{transaction.tip}</div>
            </div>

            <div className="space-y-2">
              <CardTitle>Total Price</CardTitle>
              <div className="mt-2 text-muted-foreground">{transaction.totalPrice}</div>
            </div>
          </div>
          <div className="col-span-2 flex flex-col gap-7">
            <div className="space-y-2">
              <CardTitle>Created At</CardTitle>
              <div className="mt-2 text-muted-foreground">
                {dayjs(transaction.createdAt).format('MMM DD, YYYY hh:mm:a') || 'n/a'}
              </div>
            </div>

            <div className="space-y-2">
              <CardTitle>Updated At</CardTitle>
              <div className="mt-2 text-muted-foreground">
                {transaction.updatedAt
                  ? dayjs(transaction.updatedAt).format('MMM DD, YYYY hh:mm:a')
                  : ''}
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle>Completed At</CardTitle>
              <div className="mt-2 text-muted-foreground">
                {transaction.completedAt
                  ? dayjs(transaction.completedAt).format('MMM DD, YYYY hh:mm:a')
                  : ''}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="my-6">
          <h2 className="text-2xl font-bold tracking-tight">Services</h2>
        </div>
        <div className="space-y-10">
          {transactionServices?.map((transactionService, index) => (
            <div key={transactionService.id} className="space-y-10">
              <CardTitle>Service #{index + 1}</CardTitle>
              <div className="flex flex-row gap-20">
                <div className="space-y-2">
                  <CardTitle>Service Name</CardTitle>
                  <div className="mt-2 text-muted-foreground">{transactionService.serviceName}</div>
                </div>

                <div className="space-y-2">
                  <CardTitle>Price</CardTitle>
                  <div className="mt-2 text-muted-foreground">{transactionService.price}</div>
                </div>
                <div className="space-y-2">
                  <CardTitle>Service Cut % Modifier</CardTitle>
                  <div className="mt-2 text-muted-foreground">
                    {transactionService.serviceCutPercentage}%
                  </div>
                </div>
              </div>
              <div className="mt-2 space-y-2">
                <CardTitle>Crew Earnings</CardTitle>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Crew Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Crew Service Cut %</TableHead>
                      <TableHead>Computed Cut %</TableHead>
                      <TableHead className="text-right">Amount Earned</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionService.crewEarnings.map((crewEarning) => (
                      <TableRow key={crewEarning.id}>
                        <TableCell className="font-medium">{crewEarning.crewName}</TableCell>
                        <TableCell>{crewEarning.role}</TableCell>
                        <TableCell>{crewEarning.crewServiceCutPercentage}%</TableCell>
                        <TableCell>{crewEarning.computedServiceCutPercentage}%</TableCell>
                        <TableCell className="text-right">PHP {crewEarning.amountEarned}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <Separator />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewTransaction;
