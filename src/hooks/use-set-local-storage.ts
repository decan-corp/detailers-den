import { LocalStorageKey } from 'src/constants/storage-keys';
import LocalStorage from 'src/utils/local-storage';

import { isEqual } from 'lodash';
import { useEffect, useRef } from 'react';
import { usePrevious } from 'react-use';

const useSetLocalStorage = (
  key: LocalStorageKey,
  state: Parameters<typeof LocalStorage.set>[1]
) => {
  const initialState = useRef(state);
  const prevState = usePrevious(state);

  useEffect(() => {
    if (!isEqual(prevState || initialState.current, state)) {
      LocalStorage.set(key, state);
    }
  }, [key, prevState, state]);
};

export default useSetLocalStorage;
