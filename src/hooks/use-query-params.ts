/* eslint-disable no-restricted-syntax */

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { useImmer } from 'use-immer';

const useQueryParams = <T = unknown>(paramKey: string, defaultValue: T) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isStringified = useMemo(
    () => typeof defaultValue === 'object' || Array.isArray(defaultValue),
    [defaultValue]
  );

  const parseValue = useCallback(
    (value: unknown) => {
      if (isStringified) {
        return JSON.parse(value as string) as T;
      }
      return value;
    },
    [isStringified]
  );

  const [queryParams, setQueryParams] = useImmer<T>(() => {
    const stringifiedParam = searchParams.get(paramKey);
    return (stringifiedParam ? parseValue(stringifiedParam) : defaultValue) as T;
  });

  const reset = useCallback(() => {
    router.replace('?');
  }, [router]);

  return [queryParams, setQueryParams, reset] as const;
};

export default useQueryParams;
