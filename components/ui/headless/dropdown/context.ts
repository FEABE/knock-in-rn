import { createContext, useContext } from 'react';

export type DropdownContextValue = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  selectedValue: string | undefined;
  setSelectedValue: (value: string) => void;
};

export const DropdownContext = createContext<DropdownContextValue | null>(null);

export function useDropdownContext(component: string): DropdownContextValue {
  const ctx = useContext(DropdownContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Dropdown.Root>`);
  }
  return ctx;
}
