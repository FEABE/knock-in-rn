import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type View as RNView,
  type ViewProps,
} from 'react-native';

import { RadioGroupContext, type RadioGroupContextValue } from './context';
import type { UseRadioItemReturn } from './use-radio-group';

export type RadioGroupRootViewProps = ViewProps & {
  value: RadioGroupContextValue;
  className?: string;
  children?: ReactNode;
};

export const RadioGroupRootView = forwardRef<RNView, RadioGroupRootViewProps>(
  function RadioGroupRootView({ value, children, ...rest }, ref) {
    return (
      <RadioGroupContext.Provider value={value}>
        <View ref={ref} accessibilityRole="radiogroup" {...rest}>
          {children}
        </View>
      </RadioGroupContext.Provider>
    );
  },
);

export type RadioItemState = {
  selected: boolean;
  disabled: boolean;
  pressed: boolean;
};

export type RadioItemViewProps = Omit<
  PressableProps,
  'onPress' | 'children' | 'disabled'
> &
  UseRadioItemReturn & {
    className?: string;
    children?: ReactNode | ((state: RadioItemState) => ReactNode);
  };

export const RadioItemView = forwardRef<RNView, RadioItemViewProps>(
  function RadioItemView(
    {
      isSelected,
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
                selected: isSelected,
                disabled: isDisabled,
                pressed: state.pressed,
              })
            : children
        }
      </Pressable>
    );
  },
);
