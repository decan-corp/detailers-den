'use client';

import { LocalStorageKey } from 'src/constants/local-storage';

class LocalStorage {
  static get<T = unknown>(key: LocalStorageKey) {
    let item: string | null;
    try {
      item = localStorage?.getItem(key);
    } catch {
      return null;
    }

    if (!item) {
      return item;
    }

    return JSON.parse(item) as T;
  }

  static set(key: LocalStorageKey, payload: Record<string, unknown> | number | string | string[]) {
    localStorage.setItem(key, JSON.stringify(payload));
  }

  static delete(key: LocalStorageKey) {
    localStorage.removeItem(key);
  }

  static deleteAll() {
    localStorage.clear();
  }
}

export default LocalStorage;
