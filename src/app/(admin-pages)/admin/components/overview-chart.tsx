import dayjs from 'dayjs';
import { useMemo } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const OverviewChart = () => {
  const data = useMemo(() => {
    const now = dayjs();
    const format = 'MM-DD';
    const list = [];
    for (let key = 13; key !== 0; key -= 1) {
      list.push({
        name: now.subtract(key, 'day').format(format),
        total: Math.floor(Math.random() * 10) + 10,
      });
    }

    list.push({
      name: 'Now',
      total: Math.floor(Math.random() * 10) + 10,
    });

    return list;
  }, []);

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}`}
        />
        <Tooltip />
        <Bar dataKey="total" fill="#adfa1d" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default OverviewChart;
