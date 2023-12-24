import { getPerDayTransactionsCount } from 'src/actions/transactions/get-per-day-transactions-count';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

const OverviewChart = () => {
  const { data } = useQuery({
    queryKey: [Entity.Transactions, 'recent-transactions-count'],
    queryFn: async () => {
      const { data: records } = await getPerDayTransactionsCount({
        startDate: dayjs().subtract(13, 'days').startOf('day').toDate(),
        endDate: dayjs().endOf('day').toDate(),
      });

      return (records || []).map((record) => ({
        name: dayjs(record.day, 'YYYY-MM-DD').format('MM-DD'),
        total: record.count,
      }));
    },
  });

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
