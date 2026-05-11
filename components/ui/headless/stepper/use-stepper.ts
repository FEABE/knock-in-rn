import { useCallback, useMemo } from 'react';

import { useControllableState } from '../use-controllable-state';
import type { StepperContextValue } from './context';
import { useStepperContext } from './context';

export type UseStepperRootProps = {
  total: number;
  current?: number;
  defaultCurrent?: number;
  onChange?: (current: number) => void;
  onComplete?: () => void;
};

export function useStepperRoot({
  total,
  current,
  defaultCurrent = 0,
  onChange,
  onComplete,
}: UseStepperRootProps): StepperContextValue {
  const [value, setValue] = useControllableState<number>({
    value: current,
    defaultValue: defaultCurrent,
    onChange,
  });
  const idx = value ?? 0;
  const last = Math.max(0, total - 1);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.min(Math.max(next, 0), last);
      setValue(clamped);
    },
    [last, setValue],
  );

  const next = useCallback(() => {
    if (idx >= last) {
      onComplete?.();
      return;
    }
    setValue(idx + 1);
  }, [idx, last, onComplete, setValue]);

  const prev = useCallback(() => {
    if (idx <= 0) return;
    setValue(idx - 1);
  }, [idx, setValue]);

  const reset = useCallback(() => setValue(0), [setValue]);

  return useMemo<StepperContextValue>(
    () => ({
      current: idx,
      total,
      isFirst: idx === 0,
      isLast: idx === last,
      progress: total <= 1 ? 1 : idx / last,
      next,
      prev,
      goTo,
      reset,
    }),
    [idx, total, last, next, prev, goTo, reset],
  );
}

export function useStepperStep(index: number) {
  const ctx = useStepperContext('Stepper.Step');
  return {
    active: ctx.current === index,
    completed: ctx.current > index,
    index,
  };
}

export function useStepperNext() {
  const ctx = useStepperContext('Stepper.Next');
  return {
    onPress: ctx.next,
    isLast: ctx.isLast,
  };
}

export function useStepperPrev() {
  const ctx = useStepperContext('Stepper.Prev');
  return {
    onPress: ctx.prev,
    isFirst: ctx.isFirst,
    disabled: ctx.isFirst,
  };
}
