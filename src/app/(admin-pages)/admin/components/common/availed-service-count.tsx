import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getAvailedServiceCount } from 'src/actions/transaction-services/get-monthly-transaction-service-count';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';

const AvailedServiceCount = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data: records = [], isLoading } = useQuery({
    queryKey: [Entity.TransactionServices, 'availment-count', startDate, endDate],
    queryFn: async () => {
      const { data } = await getAvailedServiceCount({
        startDate,
        endDate,
      });
      return data;
    },
  });

  return (
    <div className="max-h-[390px] space-y-8 overflow-auto">
      {isLoading &&
        Array(5)
          .fill(null)
          .map((_, index) => (
            <div key={Symbol(index).toString()} className="flex items-center">
              <Avatar className="h-9 w-9">
                <Skeleton className="h-9 w-9" />
              </Avatar>
              <div className="ml-4 space-y-1">
                <Skeleton className="h-4 w-44" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="ml-auto h-6 w-14" />
            </div>
          ))}
      {!isLoading &&
        records.map((record) => (
          <div key={record.serviceId} className="flex items-center">
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{record.serviceName}</p>
            </div>
            <div className="ml-auto font-medium">{record.serviceCount}</div>
          </div>
        ))}
    </div>
  );
};

export default AvailedServiceCount;
