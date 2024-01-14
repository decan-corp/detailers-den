'use client';

import { getUserBySession } from 'src/actions/users/get-users';
import { Entity } from 'src/constants/entities';

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

const useClientSession = () =>
  useQuery({
    queryKey: [Entity.Users, 'loggedInUser'],
    queryFn: async () => {
      const { data, serverError } = await getUserBySession({});

      if (serverError) {
        toast.error('Failed to get client session');
        return undefined;
      }

      return data;
    },
  });

export default useClientSession;
