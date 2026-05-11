import { useMemo } from 'react';
import type {
  AccessibilityRole,
  AccessibilityState,
} from 'react-native';

export type UseButtonProps = {
  disabled?: boolean;
  loading?: boolean;
};

export type UseButtonReturn = {
  isDisabled: boolean;
  isLoading: boolean;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
};

export function useButton({ disabled, loading }: UseButtonProps): UseButtonReturn {
  const isDisabled = !!disabled || !!loading;
  const isLoading = !!loading;

  const accessibilityState = useMemo<AccessibilityState>(
    () => ({ disabled: isDisabled, busy: isLoading }),
    [isDisabled, isLoading],
  );

  return {
    isDisabled,
    isLoading,
    accessibilityRole: 'button',
    accessibilityState,
  };
}
