/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-for-in-array */
import { getPerDayTransactionsCount } from 'src/actions/transactions/get-per-day-transactions-count';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { ReactElement, useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const dateFormat = 'MM-DD';

const TransactionsCountChart = ({
  startDate,
  endDate,
}: {
  startDate?: string;
  endDate?: string;
}) => {
  const { data: transactions = [] } = useQuery({
    queryKey: [Entity.Metrics, Entity.Transactions, 'transactions-count', startDate, endDate],
    queryFn: async () => {
      if (!startDate || !endDate) return [];

      const { data: records } = await getPerDayTransactionsCount({
        startDate,
        endDate,
      });

      return (records || []).map((record) => ({
        name: dayjs(record.day, 'YYYY-MM-DD').format(dateFormat),
        total: record.count,
      }));
    },
    enabled: !!startDate && !!endDate,
  });

  const data = useMemo(() => {
    const now = dayjs();
    const list = [];
    const endOfToday = dayjs().endOf('day');
    const isFutureDate = dayjs(endDate).isAfter(endOfToday);

    const derivedEndDate = isFutureDate ? endOfToday : endDate;
    const diff = dayjs(derivedEndDate).diff(startDate, 'day');

    for (let key = diff; key !== -1; key -= 1) {
      const day = dayjs(derivedEndDate).subtract(key, 'day').format(dateFormat);
      const transactionCount = transactions.find(({ name }) => name === day);

      if (transactionCount) {
        list.push({
          ...transactionCount,
          name: day === now.format(dateFormat) ? 'Now' : transactionCount.name,
        });
      } else {
        list.push({
          name: day === now.format(dateFormat) ? 'Now' : day,
          total: null,
        });
      }
    }

    return list;
  }, [endDate, startDate, transactions]);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          className=""
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip content={CustomTooltip as unknown as ReactElement} />
        <Bar
          dataKey="total"
          fill="#adfa1d"
          radius={[4, 4, 0, 0]}
          label={{ position: 'top', className: 'fill-muted-foreground text-sm' }}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active: boolean;
  payload: { value: number }[];
  label: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="space-y-1 rounded-lg border border-border bg-background p-4 opacity-90">
        <div className="font-medium">
          {dayjs(label === 'Now' ? dayjs() : label, 'MM-DD').format('MMM DD (dddd)')}
        </div>
        <div className="font-medium">Count: {payload?.[0]?.value}</div>
      </div>
    );
  }

  return null;
};

export default TransactionsCountChart;
