import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type View as RNView,
} from 'react-native';

import type { UseToggleReturn } from './use-toggle';

export type ToggleState = {
  checked: boolean;
  disabled: boolean;
  pressed: boolean;
};

export type ToggleViewProps = Omit<
  PressableProps,
  'onPress' | 'children' | 'disabled'
> &
  UseToggleReturn & {
    className?: string;
    children?: ReactNode | ((state: ToggleState) => ReactNode);
  };

export const ToggleView = forwardRef<RNView, ToggleViewProps>(
  function ToggleView(
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
