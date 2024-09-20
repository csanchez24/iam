'use client';

import type { UserCookie } from '@/auth/types';
import type { Dictionary } from '@/i18n/get-dictionary';

import { createContext, useContext, useRef } from 'react';
import { createStore as create, useStore } from 'zustand';

export type State = {
  dictionary: Dictionary;
  setDictionary: (dictionary: Dictionary) => void;
  session?: { user: UserCookie | undefined; permissions: string[]; labels: string[] };
  setSession: (session: { user: UserCookie; permissions: string[]; labels: string[] }) => void;
};

const createStore = (initialValues: Pick<State, 'dictionary' | 'session'>) => {
  return create<State>()((set) => ({
    ...initialValues,
    setSession: (session) => set(() => ({ session })),
    setDictionary: (dictionary) => set(() => ({ dictionary })),
  }));
};

type Store = ReturnType<typeof createStore>;

type StoreProviderProps = React.PropsWithChildren<Pick<State, 'session' | 'dictionary'>>;

const StoreContext = createContext<Store | null>(null);

export const StoreProvider = ({ children, ...props }: StoreProviderProps) => {
  const storeRef = useRef<Store>();

  if (!storeRef.current) {
    storeRef.current = createStore(props);
  }

  return <StoreContext.Provider value={storeRef.current}>{children}</StoreContext.Provider>;
};

export const useStoreContext = <T,>(selector: (state: State) => T): T => {
  const store = useContext(StoreContext);
  if (!store) throw new Error('Missing StoreProvider in the tree.');
  return useStore(store, selector);
};
