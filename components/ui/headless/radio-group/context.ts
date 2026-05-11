import { createContext, useContext } from 'react';

export type RadioGroupContextValue = {
  value: string | undefined;
  setValue: (next: string) => void;
  disabled: boolean;
  name?: string;
};

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null,
);

export function useRadioGroupContext(component: string): RadioGroupContextValue {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <RadioGroup.Root>`);
  }
  return ctx;
}
