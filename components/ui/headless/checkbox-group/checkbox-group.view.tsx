import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type View as RNView,
  type ViewProps,
} from 'react-native';

import {
  CheckboxGroupContext,
  type CheckboxGroupContextValue,
} from './context';
import type { UseCheckboxGroupItemReturn } from './use-checkbox-group';

export type CheckboxGroupRootViewProps = ViewProps & {
  value: CheckboxGroupContextValue;
  className?: string;
  children?: ReactNode;
};

export const CheckboxGroupRootView = forwardRef<
  RNView,
  CheckboxGroupRootViewProps
>(function CheckboxGroupRootView({ value, children, ...rest }, ref) {
  return (
    <CheckboxGroupContext.Provider value={value}>
      <View ref={ref} {...rest}>
        {children}
      </View>
    </CheckboxGroupContext.Provider>
  );
});

export type CheckboxGroupItemState = {
  checked: boolean;
  disabled: boolean;
  pressed: boolean;
};

export type CheckboxGroupItemViewProps = Omit<
  PressableProps,
  'onPress' | 'children' | 'disabled'
> &
  UseCheckboxGroupItemReturn & {
    className?: string;
    children?: ReactNode | ((state: CheckboxGroupItemState) => ReactNode);
  };

export const CheckboxGroupItemView = forwardRef<
  RNView,
  CheckboxGroupItemViewProps
>(function CheckboxGroupItemView(
  {
    isChecked,
    isDisabled,
    onPress,
    accessibilityRole,
    accessibilityState,
    children,
    ...rest
  },
  ref,
) {
  return (
    <Pressable
      ref={ref}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityState}
      {...rest}
    >
      {(state) =>
        typeof children === 'function'
          ? children({
              checked: isChecked,
              disabled: isDisabled,
              pressed: state.pressed,
            })
          : children
      }
    </Pressable>
  );
});
