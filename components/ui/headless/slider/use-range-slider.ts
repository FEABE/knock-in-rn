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
  const current = useMemo<RangeValue>(() => internal ?? [min, max], [internal, min, max]);

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
      // 시작 손잡이가 끝 손잡이를 넘어가도 둘의 역할을 바꾸지 않고 그 자리에서 멈춘다.
      const nextStart = Math.max(min, Math.min(snapped, current[1] - minDistance));
      setInternal([nextStart, current[1]]);
    },
    [setInternal, min, max, step, minDistance, current],
  );

  const setEnd = useCallback(
    (next: number) => {
      const snapped = snap(next, min, max, step);
      // 끝 손잡이도 시작 손잡이를 밀어내지 않고 현재 범위 안에서만 움직인다.
      const nextEnd = Math.min(max, Math.max(snapped, current[0] + minDistance));
      setInternal([current[0], nextEnd]);
    },
    [setInternal, min, max, step, minDistance, current],
  );

  const percents = useMemo<[number, number]>(() => {
    if (max === min) return [0, 0];
    return [((current[0] - min) / (max - min)) * 100, ((current[1] - min) / (max - min)) * 100];
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
