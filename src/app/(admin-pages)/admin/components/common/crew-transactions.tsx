import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { getCrewEarnings } from 'src/actions/crew-earnings/get-crew-earnings';
import { Entity } from 'src/constants/entities';
import { getInitials } from 'src/utils/formatters';

import { useQuery } from '@tanstack/react-query';

const CrewTransactions = ({ startDate, endDate }: { startDate: Date; endDate: Date }) => {
  const { data: crewEarnings = [], isLoading } = useQuery({
    queryKey: [Entity.Metrics, Entity.CrewEarnings, startDate, endDate],
    queryFn: async () => {
      const { data } = await getCrewEarnings({
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
        crewEarnings.map((crewEarning) => (
          <div key={crewEarning.crewId} className="flex items-center pr-4">
            <Avatar className="h-9 w-9">
              <AvatarImage src={crewEarning.image || ''} alt="Avatar" />
              <AvatarFallback>{getInitials(crewEarning.crewName)}</AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">{crewEarning.crewName}</p>
              <p className="text-sm text-muted-foreground">{crewEarning.role}</p>
            </div>
            <div className="ml-auto font-medium">Php {crewEarning.amount}</div>
          </div>
        ))}
      {!isLoading && crewEarnings.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">No results found</div>
      )}
    </div>
  );
};

export default CrewTransactions;
