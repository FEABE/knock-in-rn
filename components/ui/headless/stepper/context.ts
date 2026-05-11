import { createContext, useContext } from 'react';

export type StepperContextValue = {
  current: number;
  total: number;
  isFirst: boolean;
  isLast: boolean;
  progress: number;
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  reset: () => void;
};

export const StepperContext = createContext<StepperContextValue | null>(null);

export function useStepperContext(component: string): StepperContextValue {
  const ctx = useContext(StepperContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Stepper.Root>`);
  }
  return ctx;
}
