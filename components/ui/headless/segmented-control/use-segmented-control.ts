import { useCallback, useMemo } from 'react';

import { useControllableState } from '../use-controllable-state';

export type SegmentedOption<V extends string = string> = {
  value: V;
  label: string;
  disabled?: boolean;
};

export type UseSegmentedControlProps<V extends string = string> = {
  options: readonly SegmentedOption<V>[];
  value?: V | null;
  defaultValue?: V | null;
  onValueChange?: (value: V) => void;
  disabled?: boolean;
};

export type SegmentItemState<V extends string = string> = {
  option: SegmentedOption<V>;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

export type UseSegmentedControlReturn<V extends string = string> = {
  value: V | null;
  items: SegmentItemState<V>[];
  isDisabled: boolean;
  setValue: (next: V) => void;
};

export function useSegmentedControl<V extends string = string>({
  options,
  value,
  defaultValue = null,
  onValueChange,
  disabled,
}: UseSegmentedControlProps<V>): UseSegmentedControlReturn<V> {
  const [current, setCurrent] = useControllableState<V | null>({
    value,
    defaultValue,
    onChange: (v) => v !== null && onValueChange?.(v),
  });

  const setValue = useCallback(
    (next: V) => {
      if (disabled) return;
      setCurrent(next);
    },
    [disabled, setCurrent],
  );

  const items = useMemo<SegmentItemState<V>[]>(
    () =>
      options.map((opt) => ({
        option: opt,
        selected: current === opt.value,
        disabled: !!disabled || !!opt.disabled,
        onPress: () => setValue(opt.value),
      })),
    [options, current, disabled, setValue],
  );

  return {
    value: current ?? null,
    items,
    isDisabled: !!disabled,
    setValue,
  };
}
