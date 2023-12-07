'use client';

import { Provider, createStore } from 'jotai';
import { ReactNode } from 'react';

export const jotaiStore = createStore();

export const JotaiProvider = ({ children }: { children: ReactNode }) => (
  <Provider store={jotaiStore}>{children}</Provider>
);
