'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { Label } from '@/components/ui/label';
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
    <div className="space-y-16 bg-background p-4 sm:p-10 sm:px-12">
      <div className="space-y-6">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Transaction Details</h2>
          <p className="text-muted-foreground">{transaction.plateNumber}</p>
        </div>
        <Card>
          <CardContent className="grid grid-cols-4 gap-y-10 pt-6 sm:grid-cols-6">
            <div className="col-span-2 flex flex-col gap-6">
              <div className="space-y-1">
                <Label>Customer Name</Label>
                <div className="mt-2 text-sm text-muted-foreground">{transaction.customerName}</div>
              </div>
              <div className="space-y-1">
                <Label>Status</Label>
                <div className="mt-2 text-sm text-muted-foreground">{transaction.status}</div>
              </div>
              <div className="space-y-1">
                <Label>Vehicle Size</Label>
                <div className="mt-2 text-sm text-muted-foreground">{transaction.vehicleSize}</div>
              </div>
              <div className="space-y-1">
                <Label>Mode of Payment</Label>
                <div className="mt-2 text-sm text-muted-foreground">
                  {transaction.modeOfPayment}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Note</Label>
                <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                  {transaction.note}
                </div>
              </div>
            </div>
            <div className="col-span-2 flex flex-col gap-6">
              <div className="space-y-1">
                <Label>Discount</Label>
                <div className="mt-2 text-sm text-muted-foreground">{transaction.discount}</div>
              </div>
              <div className="space-y-1">
                <Label>Tip</Label>
                <div className="mt-2 text-sm text-muted-foreground">{transaction.tip}</div>
              </div>
              <div className="space-y-1">
                <Label>Total Price</Label>
                <div className="mt-2 text-sm text-muted-foreground">
                  Php {transaction.totalPrice}
                </div>
              </div>
            </div>
            <div className="col-span-2 flex flex-col gap-6">
              <div className="space-y-1">
                <Label>Created At</Label>
                <div className="mt-2 text-sm text-muted-foreground">
                  {dayjs(transaction.createdAt).format('MMM DD, YYYY hh:mm:a') || 'n/a'}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Updated At</Label>
                <div className="mt-2 text-sm text-muted-foreground">
                  {transaction.updatedAt
                    ? dayjs(transaction.updatedAt).format('MMM DD, YYYY hh:mm:a')
                    : ''}
                </div>
              </div>
              <div className="space-y-1">
                <Label>Completed At</Label>
                <div className="mt-2 text-sm text-muted-foreground">
                  {transaction.completedAt
                    ? dayjs(transaction.completedAt).format('MMM DD, YYYY hh:mm:a')
                    : ''}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="my-6">
          <h2 className="text-2xl font-bold tracking-tight">Availed Services</h2>
        </div>
        <div className="space-y-10">
          {transactionServices?.map((transactionService, index) => (
            <Card key={transactionService.id} className="">
              <CardHeader>
                <CardTitle>Service #{index + 1}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-x-32 gap-y-6 py-4 sm:flex-row">
                  <div className="space-y-1">
                    <Label>Service Name</Label>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {transactionService.serviceName}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Price</Label>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {transactionService.price}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Service Cut % Modifier</Label>
                    <div className="mt-2 text-sm text-muted-foreground">
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
                          <TableCell className="text-right">
                            PHP {crewEarning.amountEarned}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewTransaction;
