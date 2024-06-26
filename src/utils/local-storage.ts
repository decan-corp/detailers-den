'use client';

import { LocalStorageKey } from 'src/constants/storage-keys';

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

  static set(key: LocalStorageKey, payload: unknown) {
    localStorage.setItem(key, JSON.stringify(payload ?? null));
  }

  static delete(key: LocalStorageKey) {
    localStorage.removeItem(key);
  }

  static deleteAll() {
    localStorage.clear();
  }
}

export default LocalStorage;
