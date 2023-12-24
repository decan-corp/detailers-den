import { getPerDayTransactionsCount } from 'src/actions/transactions/get-per-day-transactions-count';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const dateFormat = 'MM-DD';

const OverviewChart = () => {
  const { data: transactionCounts = [] } = useQuery({
    queryKey: [Entity.Transactions, 'recent-transactions-count'],
    queryFn: async () => {
      const { data: records } = await getPerDayTransactionsCount({
        startDate: dayjs().subtract(13, 'days').startOf('day').toDate(),
        endDate: dayjs().endOf('day').toDate(),
      });

      return (records || []).map((record) => ({
        name: dayjs(record.day, 'YYYY-MM-DD').format(dateFormat),
        total: record.count,
      }));
    },
  });

  const data = useMemo(() => {
    const now = dayjs();
    const list = [];

    for (let key = 13; key !== -1; key -= 1) {
      const day = now.subtract(key, 'day').format(dateFormat);
      const transactionCount = transactionCounts.find(({ name }) => name === day);

      if (transactionCount) {
        list.push({
          ...transactionCount,
          name: day === now.format(dateFormat) ? 'Now' : transactionCount.name,
        });
      } else {
        list.push({
          name: now.subtract(key, 'day').format(dateFormat),
          total: 0,
        });
      }
    }

    return list;
  }, [transactionCounts]);

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
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OverviewChart;
