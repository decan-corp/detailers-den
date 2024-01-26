/* eslint-disable no-restricted-syntax */

import { isEmpty } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import { useCallback, useMemo, useRef } from 'react';
import { useDebounce } from 'react-use';
import { useImmer } from 'use-immer';

const useQueryParams = <T = unknown>(paramKey: string, defaultValue: T) => {
  const router = useRouter();
  const isMounted = useRef(false);
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

  const formatValue = useCallback(
    (value: unknown) => {
      if (isStringified) {
        return JSON.stringify(value);
      }
      return value;
    },
    [isStringified]
  );

  useDebounce(
    () => {
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }

      const parsedUrl = queryString.parse(searchParams.toString());

      const stringifiedParams = queryString.stringify({
        ...parsedUrl,
        [paramKey]: !isEmpty(queryParams) ? formatValue(queryParams) : undefined,
      });

      // TODO: fix page index not applying when refreshed

      // Using `window.history.replace` instead of Next.js `router.replace` to update search params
      // without triggering redirection. `router.replace` causes redirection, while `window.history.replace`
      // ensures a seamless update to the URL state without disrupting the current page.
      window.history.replaceState(null, '', `?${stringifiedParams}`);
    },
    300,
    [queryParams, searchParams]
  );

  const reset = useCallback(() => {
    router.replace('?');
  }, [router]);

  return [queryParams, setQueryParams, reset] as const;
};

export default useQueryParams;
