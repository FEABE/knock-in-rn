import { useCallback, useMemo } from 'react';
import type {
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';

import { useControllableState } from '../use-controllable-state';
import type { RadioGroupContextValue } from './context';
import { useRadioGroupContext } from './context';

export type UseRadioGroupRootProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  name?: string;
};

export function useRadioGroupRoot({
  value,
  defaultValue,
  onValueChange,
  disabled,
  name,
}: UseRadioGroupRootProps): RadioGroupContextValue {
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  return useMemo<RadioGroupContextValue>(
    () => ({
      value: current,
      setValue: setCurrent,
      disabled: !!disabled,
      name,
    }),
    [current, setCurrent, disabled, name],
  );
}

export type UseRadioItemProps = {
  value: string;
  disabled?: boolean;
};

export type UseRadioItemReturn = {
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
};

export function useRadioItem({
  value,
  disabled,
}: UseRadioItemProps): UseRadioItemReturn {
  const ctx = useRadioGroupContext('RadioGroup.Item');
  const isSelected = ctx.value === value;
  const isDisabled = ctx.disabled || !!disabled;

  const onPress = useCallback(() => {
    if (!isDisabled) ctx.setValue(value);
  }, [ctx, value, isDisabled]);

  const accessibilityState = useMemo<AccessibilityState>(
    () => ({ checked: isSelected, disabled: isDisabled }),
    [isSelected, isDisabled],
  );

  return {
    isSelected,
    isDisabled,
    onPress,
    accessibilityRole: 'radio',
    accessibilityState,
  };
}
