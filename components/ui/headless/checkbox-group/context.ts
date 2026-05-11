import { createContext, useContext } from 'react';

export type CheckboxGroupContextValue = {
  value: string[];
  toggle: (value: string) => void;
  disabled: boolean;
  max?: number;
  isAtMax: boolean;
};

export const CheckboxGroupContext =
  createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroupContext(
  component: string,
): CheckboxGroupContextValue {
  const ctx = useContext(CheckboxGroupContext);
  if (!ctx) {
    throw new Error(
      `<${component}> must be used inside <CheckboxGroup.Root>`,
    );
  }
  return ctx;
}
