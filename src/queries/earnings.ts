import { getCrewEarningsBreakdown } from 'src/actions/crew-earnings/get-breakdown';
import { Entity } from 'src/constants/entities';
import { handleSafeActionError } from 'src/utils/error-handling';

import { UseQueryOptions } from '@tanstack/react-query';

export const getEarningsStatementQuery = (
  params: Partial<Parameters<typeof getCrewEarningsBreakdown>[0]>
) =>
  ({
    queryKey: [Entity.CrewEarnings, 'statement', params],
    queryFn: async () => {
      const result = await getCrewEarningsBreakdown(params as Required<typeof params>);

      if (result.serverError || result.validationErrors) {
        handleSafeActionError(result);
        return undefined;
      }

      return result.data;
    },
    enabled: !!params.crewId && !!params.createdAt?.from && !!params.createdAt.to,
  }) satisfies UseQueryOptions;
