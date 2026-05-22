import { useCallback, useMemo } from 'react';
import type { AccessibilityRole, AccessibilityState } from 'react-native';

import { useControllableState } from '../use-controllable-state';
import type { TabsContextValue } from './context';
import { useTabsContext } from './context';

export type UseTabsRootProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (next: string) => void;
  disabled?: boolean;
};

export function useTabsRoot({
  value,
  defaultValue = '',
  onValueChange,
  disabled,
}: UseTabsRootProps): TabsContextValue {
  const [current, setCurrent] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  return useMemo<TabsContextValue>(
    () => ({
      value: current ?? '',
      setValue: setCurrent,
      disabled: !!disabled,
    }),
    [current, setCurrent, disabled],
  );
}

export type UseTabsTriggerProps = {
  value: string;
  disabled?: boolean;
};

export type UseTabsTriggerReturn = {
  isSelected: boolean;
  isDisabled: boolean;
  onPress: () => void;
  accessibilityRole: AccessibilityRole;
  accessibilityState: AccessibilityState;
};

export function useTabsTrigger({
  value,
  disabled,
}: UseTabsTriggerProps): UseTabsTriggerReturn {
  const ctx = useTabsContext('Tabs.Trigger');
  const isSelected = ctx.value === value;
  const isDisabled = ctx.disabled || !!disabled;

  const onPress = useCallback(() => {
    if (!isDisabled) ctx.setValue(value);
  }, [ctx, value, isDisabled]);

  const accessibilityState = useMemo<AccessibilityState>(
    () => ({ selected: isSelected, disabled: isDisabled }),
    [isSelected, isDisabled],
  );

  return {
    isSelected,
    isDisabled,
    onPress,
    accessibilityRole: 'tab',
    accessibilityState,
  };
}

export function useTabsContent(value: string) {
  const ctx = useTabsContext('Tabs.Content');
  return {
    isActive: ctx.value === value,
  };
}
