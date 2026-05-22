import { useCallback, useMemo } from 'react';

import { useControllableState } from '../use-controllable-state';

export type ChipOption<V extends string = string> = {
  value: V;
  label: string;
  disabled?: boolean;
};

export type UseChipMultiSelectProps<V extends string = string> = {
  options: readonly ChipOption<V>[];
  value?: V[];
  defaultValue?: V[];
  onValueChange?: (value: V[]) => void;
  max?: number;
  onMaxReached?: () => void;
  disabled?: boolean;
};

export type ChipItemState<V extends string = string> = {
  option: ChipOption<V>;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

export type UseChipMultiSelectReturn<V extends string = string> = {
  value: V[];
  items: ChipItemState<V>[];
  isDisabled: boolean;
  isAtMax: boolean;
  max?: number;
  remaining: number | null;
  toggle: (next: V) => void;
  clear: () => void;
};

export function useChipMultiSelect<V extends string = string>({
  options,
  value,
  defaultValue,
  onValueChange,
  max,
  onMaxReached,
  disabled,
}: UseChipMultiSelectProps<V>): UseChipMultiSelectReturn<V> {
  const [current, setCurrent] = useControllableState<V[]>({
    value,
    defaultValue: defaultValue ?? [],
    onChange: onValueChange,
  });
  const list = current ?? [];

  const toggle = useCallback(
    (next: V) => {
      if (disabled) return;
      const exists = list.includes(next);
      if (exists) {
        setCurrent(list.filter((v) => v !== next));
        return;
      }
      if (max !== undefined && list.length >= max) {
        onMaxReached?.();
        return;
      }
      setCurrent([...list, next]);
    },
    [list, max, setCurrent, onMaxReached, disabled],
  );

  const clear = useCallback(() => {
    if (disabled) return;
    setCurrent([]);
  }, [disabled, setCurrent]);

  const isAtMax = max !== undefined && list.length >= max;

  const items = useMemo<ChipItemState<V>[]>(
    () =>
      options.map((opt) => {
        const selected = list.includes(opt.value);
        const itemDisabled =
          !!disabled || !!opt.disabled || (!selected && isAtMax);
        return {
          option: opt,
          selected,
          disabled: itemDisabled,
          onPress: () => toggle(opt.value),
        };
      }),
    [options, list, disabled, isAtMax, toggle],
  );

  return {
    value: list,
    items,
    isDisabled: !!disabled,
    isAtMax,
    max,
    remaining: max === undefined ? null : Math.max(0, max - list.length),
    toggle,
    clear,
  };
}
