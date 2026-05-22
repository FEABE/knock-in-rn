import { createContext, useContext } from 'react';

export type TabsContextValue = {
  value: string;
  setValue: (next: string) => void;
  disabled: boolean;
};

export const TabsContext = createContext<TabsContextValue | null>(null);

export function useTabsContext(component: string): TabsContextValue {
  const ctx = useContext(TabsContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Tabs.Root>`);
  }
  return ctx;
}
