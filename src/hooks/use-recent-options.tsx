import { LocalStorageKey } from 'src/constants/storage-keys';
import LocalStorage from 'src/utils/local-storage';

import { useMemo } from 'react';
import { useImmer } from 'use-immer';

export const useRecentOptions = (
  storageKey: LocalStorageKey,
  options?: {
    maxRecentLength?: number;
  }
) => {
  const [recentSelections, setRecentSelections] = useImmer(() => []);

  const storedRecentSelections = useMemo(() => {
    const savedList = LocalStorage.get<string[]>(storageKey);
    if (!savedList || !Array.isArray(savedList)) return [];
    return savedList;
  }, [storageKey]);

  const saveRecentSelections = (option?: string) => {
    const combinedList = [...storedRecentSelections, ...recentSelections];

    // we may want to just save directly to storage without using setRecentSelections
    if (option) {
      combinedList.push(option);
    }

    const derivedList = combinedList.slice(
      combinedList.length - (options?.maxRecentLength || 2),
      combinedList.length
    );

    LocalStorage.set(storageKey, derivedList);
  };

  return {
    recentSelections,
    setRecentSelections,
    saveRecentSelections,
    storedRecentSelections,
  };
};
