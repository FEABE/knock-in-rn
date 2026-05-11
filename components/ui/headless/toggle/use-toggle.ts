import { useCallback, useMemo } from 'react';
import type {
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';

import { useControllableState } from '../use-controllable-state';

export type UseToggleProps = {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
};

export type UseToggleReturn = {
  isChecked: boolean;
  isDisabled: boolean;
  onPress: () => void;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
};

export function useToggle({
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
}: UseToggleProps): UseToggleReturn {
  const [value, setValue] = useControllableState<boolean>({
    value: checked,
    defaultValue: defaultChecked,
    onChange: onCheckedChange,
  });

  const isChecked = !!value;
  const isDisabled = !!disabled;

  const onPress = useCallback(() => setValue(!isChecked), [isChecked, setValue]);

  const accessibilityState = useMemo<AccessibilityState>(
    () => ({ checked: isChecked, disabled: isDisabled }),
    [isChecked, isDisabled],
  );

  return {
    isChecked,
    isDisabled,
    onPress,
    accessibilityRole: 'switch',
    accessibilityState,
  };
}
