/* eslint-disable no-restricted-syntax */
import { isEmpty } from 'lodash';
import { useSearchParams } from 'next/navigation';
import queryString from 'query-string';
import { useCallback, useRef } from 'react';
import { useDebounce } from 'react-use';

/**
 * We are separating the setting of search params in the URL search params so that
 * we will only have one debounce for each `useQueryParam` hook used.
 * This is in contrast to the previous implementation wherein setting the URL search params
 * is built into `useQueryParam`. This hook aims to prevent race conditions when updating
 * the search parameters and minimize unnecessary updates.
 */
const useSetSearchParams = (params: Record<string, unknown>) => {
  const isMounted = useRef(false);
  const searchParams = useSearchParams();

  const formatValue = useCallback((value: unknown) => {
    const isStringified = typeof value === 'object' || Array.isArray(value);
    if (isStringified) {
      return JSON.stringify(value);
    }
    return value;
  }, []);

  useDebounce(
    () => {
      if (!isMounted.current) {
        isMounted.current = true;
        return;
      }

      const parsedUrl = queryString.parse(searchParams.toString());

      const objParams: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(params)) {
        objParams[key] = !isEmpty(value) ? formatValue(value) : undefined;
      }

      const stringifiedParams = queryString.stringify({
        ...parsedUrl,
        ...objParams,
      });

      // Using `window.history.replace` instead of Next.js `router.replace` to update search params
      // without triggering redirection. `router.replace` causes redirection, while `window.history.replace`
      // ensures a seamless update to the URL state without disrupting the current page.
      window.history.replaceState(null, '', `?${stringifiedParams}`);
    },
    500,
    [params, searchParams]
  );
};

export default useSetSearchParams;
