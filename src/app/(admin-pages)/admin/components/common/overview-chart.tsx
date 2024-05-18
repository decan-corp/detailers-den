/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable @typescript-eslint/no-for-in-array */
import { getPerDayTransactionsCount } from 'src/actions/transactions/get-per-day-transactions-count';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

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
    const isFutureDate = dayjs(endDate).isAfter(dayjs().endOf('day'));
    const diff = dayjs(isFutureDate ? dayjs() : endDate).diff(startDate, 'day');

    for (let key = diff; key !== -1; key -= 1) {
      const day = now.subtract(key, 'day').format(dateFormat);
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
        {/* <Tooltip /> */}
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

export default TransactionsCountChart;
