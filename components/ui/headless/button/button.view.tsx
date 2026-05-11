import { forwardRef, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  type PressableProps,
  type View as RNView,
} from 'react-native';

import type { UseButtonReturn } from './use-button';

export type ButtonState = {
  pressed: boolean;
  hovered: boolean;
  disabled: boolean;
  loading: boolean;
};

export type ButtonViewProps = Omit<PressableProps, 'children' | 'disabled'> &
  UseButtonReturn & {
    className?: string;
    loadingIndicator?: ReactNode;
    children?: ReactNode | ((state: ButtonState) => ReactNode);
  };

export const ButtonView = forwardRef<RNView, ButtonViewProps>(
  function ButtonView(
    {
      isDisabled,
      isLoading,
      accessibilityRole,
      accessibilityState,
      loadingIndicator,
      children,
      ...rest
    },
    ref,
  ) {
    return (
      <Pressable
        ref={ref}
        accessibilityRole={accessibilityRole}
        accessibilityState={accessibilityState}
        disabled={isDisabled}
        {...rest}
      >
        {(state) => {
          if (isLoading) {
            return <View>{loadingIndicator ?? <ActivityIndicator />}</View>;
          }
          const buttonState: ButtonState = {
            pressed: state.pressed,
            hovered: !!(state as { hovered?: boolean }).hovered,
            disabled: isDisabled,
            loading: isLoading,
          };
          if (typeof children === 'function') {
            return <>{children(buttonState)}</>;
          }
          if (typeof children === 'string') {
            return <Text>{children}</Text>;
          }
          return <>{children}</>;
        }}
      </Pressable>
    );
  },
);
