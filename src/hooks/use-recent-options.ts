import { LocalStorageKey } from 'src/constants/storage-keys';
import LocalStorage from 'src/utils/local-storage';

import { useCallback, useMemo } from 'react';

export const useRecentOptions = (
  storageKey: LocalStorageKey,
  options?: {
    maxRecentLength?: number;
  }
) => {
  const storedRecentSelections = useMemo(() => {
    const savedList = LocalStorage.get<string[]>(storageKey);
    if (!savedList || !Array.isArray(savedList)) return [];
    return savedList;
  }, [storageKey]);

  const saveRecentSelections = useCallback(
    (option: string) => {
      const list = [...storedRecentSelections, option];

      const derivedList = list.slice(list.length - (options?.maxRecentLength || 2), list.length);

      LocalStorage.set(storageKey, derivedList);
    },
    [options?.maxRecentLength, storageKey, storedRecentSelections]
  );

  return {
    saveRecentSelections,
    storedRecentSelections,
  };
};
