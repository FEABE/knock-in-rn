import { useCallback, useMemo } from 'react';
import type {
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';

import { useControllableState } from '../use-controllable-state';
import type { CheckboxGroupContextValue } from './context';
import { useCheckboxGroupContext } from './context';

export type UseCheckboxGroupRootProps = {
  value?: string[];
  defaultValue?: string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  max?: number;
  onMaxReached?: () => void;
};

export function useCheckboxGroupRoot({
  value,
  defaultValue = [],
  onValueChange,
  disabled,
  max,
  onMaxReached,
}: UseCheckboxGroupRootProps): CheckboxGroupContextValue {
  const [current, setCurrent] = useControllableState<string[]>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  const list = current ?? [];

  const toggle = useCallback(
    (next: string) => {
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
    [list, max, setCurrent, onMaxReached],
  );

  return useMemo<CheckboxGroupContextValue>(
    () => ({
      value: list,
      toggle,
      disabled: !!disabled,
      max,
      isAtMax: max !== undefined && list.length >= max,
    }),
    [list, toggle, disabled, max],
  );
}

export type UseCheckboxGroupItemProps = {
  value: string;
  disabled?: boolean;
};

export type UseCheckboxGroupItemReturn = {
  isChecked: boolean;
  isDisabled: boolean;
  onPress: () => void;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
};

export function useCheckboxGroupItem({
  value,
  disabled,
}: UseCheckboxGroupItemProps): UseCheckboxGroupItemReturn {
  const ctx = useCheckboxGroupContext('CheckboxGroup.Item');
  const isChecked = ctx.value.includes(value);
  const isDisabled =
    ctx.disabled || !!disabled || (!isChecked && ctx.isAtMax);

  const onPress = useCallback(() => {
    if (!isDisabled) ctx.toggle(value);
  }, [ctx, value, isDisabled]);

  const accessibilityState = useMemo<AccessibilityState>(
    () => ({ checked: isChecked, disabled: isDisabled }),
    [isChecked, isDisabled],
  );

  return {
    isChecked,
    isDisabled,
    onPress,
    accessibilityRole: 'checkbox',
    accessibilityState,
  };
}
