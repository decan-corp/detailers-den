import { getServiceOptions } from 'src/actions/services/get-services';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';

export const useServiceOptions = () =>
  useQuery({
    queryKey: [Entity.Services, 'options'],
    queryFn: async () => {
      const { data } = await getServiceOptions({
        sortBy: { id: 'serviceName', desc: false },
        pageSize: 99,
      });

      return data;
    },
  });
