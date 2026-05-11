import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type View as RNView,
} from 'react-native';

import type { UseCheckboxReturn } from './use-checkbox';

export type CheckboxState = {
  checked: boolean;
  disabled: boolean;
  pressed: boolean;
};

export type CheckboxViewProps = Omit<
  PressableProps,
  'onPress' | 'children' | 'disabled'
> &
  UseCheckboxReturn & {
    className?: string;
    children?: ReactNode | ((state: CheckboxState) => ReactNode);
  };

export const CheckboxView = forwardRef<RNView, CheckboxViewProps>(
  function CheckboxView(
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
  },
);
