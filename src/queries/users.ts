import { getUserOptions } from 'src/actions/users/get-users';
import { Role } from 'src/constants/common';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';

export const useCrewOptions = () =>
  useQuery({
    queryKey: [Entity.Users, 'crews'],
    queryFn: async () => {
      const { data } = await getUserOptions({
        role: [Role.Crew, Role.Detailer, Role.StayInCrew],
        sortBy: { id: 'name', desc: false },
        pageSize: 99,
      });

      return data;
    },
  });
