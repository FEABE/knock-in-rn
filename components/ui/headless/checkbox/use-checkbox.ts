import { useCallback, useMemo } from 'react';
import type {
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';

import { useControllableState } from '../use-controllable-state';

export type UseCheckboxProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export type UseCheckboxReturn = {
  isChecked: boolean;
  isDisabled: boolean;
  onPress: () => void;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
};

export function useCheckbox({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
}: UseCheckboxProps): UseCheckboxReturn {
  const [value, setValue] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const isChecked = !!value;
  const isDisabled = !!disabled;

  const onPress = useCallback(
    () => setValue(!isChecked),
    [isChecked, setValue],
  );

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
