import { useCallback, useMemo } from 'react';

import { useControllableState } from '../use-controllable-state';

export type UseSliderProps = {
  value?: number;
  defaultValue?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
};

export type UseSliderReturn = {
  value: number;
  setValue: (next: number) => void;
  percent: number;
  min: number;
  max: number;
  step: number;
  isDisabled: boolean;
  increment: () => void;
  decrement: () => void;
};

function snap(v: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, v));
  const steps = Math.round((clamped - min) / step);
  return Math.min(max, min + steps * step);
}

export function useSlider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
}: UseSliderProps): UseSliderReturn {
  const [internal, setInternal] = useControllableState<number>({
    value,
    defaultValue: defaultValue ?? min,
    onChange: onValueChange,
  });
  const current = internal ?? min;

  const setValue = useCallback(
    (next: number) => setInternal(snap(next, min, max, step)),
    [setInternal, min, max, step],
  );

  const increment = useCallback(
    () => setValue(current + step),
    [current, step, setValue],
  );
  const decrement = useCallback(
    () => setValue(current - step),
    [current, step, setValue],
  );

  const percent = useMemo(
    () => (max === min ? 0 : ((current - min) / (max - min)) * 100),
    [current, min, max],
  );

  return {
    value: current,
    setValue,
    percent,
    min,
    max,
    step,
    isDisabled: !!disabled,
    increment,
    decrement,
  };
}
