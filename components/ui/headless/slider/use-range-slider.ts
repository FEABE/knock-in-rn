import { useCallback, useMemo } from 'react';

import { useControllableState } from '../use-controllable-state';

export type RangeValue = [number, number];

export type UseRangeSliderProps = {
  value?: RangeValue;
  defaultValue?: RangeValue;
  onValueChange?: (value: RangeValue) => void;
  min?: number;
  max?: number;
  step?: number;
  minDistance?: number;
  disabled?: boolean;
};

export type UseRangeSliderReturn = {
  value: RangeValue;
  setStart: (next: number) => void;
  setEnd: (next: number) => void;
  setValue: (next: RangeValue) => void;
  percents: [number, number];
  min: number;
  max: number;
  step: number;
  isDisabled: boolean;
};

function snap(v: number, min: number, max: number, step: number): number {
  const clamped = Math.min(max, Math.max(min, v));
  const steps = Math.round((clamped - min) / step);
  return Math.min(max, min + steps * step);
}

export function useRangeSlider({
  value,
  defaultValue,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  minDistance = 0,
  disabled,
}: UseRangeSliderProps): UseRangeSliderReturn {
  const [internal, setInternal] = useControllableState<RangeValue>({
    value,
    defaultValue: defaultValue ?? [min, max],
    onChange: onValueChange,
  });
  const current: RangeValue = internal ?? [min, max];

  const setValue = useCallback(
    (next: RangeValue) => {
      const a = snap(next[0], min, max, step);
      const b = snap(next[1], min, max, step);
      const [lo, hi] = a <= b ? [a, b] : [b, a];
      if (hi - lo < minDistance) return;
      setInternal([lo, hi]);
    },
    [setInternal, min, max, step, minDistance],
  );

  const setStart = useCallback(
    (next: number) => {
      const snapped = snap(next, min, max, step);
      const upper = Math.max(snapped + minDistance, current[1]);
      setInternal([Math.min(snapped, current[1] - minDistance), upper]);
    },
    [setInternal, min, max, step, minDistance, current],
  );

  const setEnd = useCallback(
    (next: number) => {
      const snapped = snap(next, min, max, step);
      const lower = Math.min(current[0], snapped - minDistance);
      setInternal([lower, Math.max(snapped, current[0] + minDistance)]);
    },
    [setInternal, min, max, step, minDistance, current],
  );

  const percents = useMemo<[number, number]>(() => {
    if (max === min) return [0, 0];
    return [
      ((current[0] - min) / (max - min)) * 100,
      ((current[1] - min) / (max - min)) * 100,
    ];
  }, [current, min, max]);

  return {
    value: current,
    setStart,
    setEnd,
    setValue,
    percents,
    min,
    max,
    step,
    isDisabled: !!disabled,
  };
}
