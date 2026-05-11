import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type View as RNView,
  type ViewProps,
} from 'react-native';

import { DropdownContext, type DropdownContextValue } from './context';

export type DropdownRootViewProps = {
  value: DropdownContextValue;
  children?: ReactNode;
};

export function DropdownRootView({ value, children }: DropdownRootViewProps) {
  return (
    <DropdownContext.Provider value={value}>
      {children}
    </DropdownContext.Provider>
  );
}

export type DropdownTriggerViewProps = PressableProps & {
  className?: string;
};

export const DropdownTriggerView = forwardRef<RNView, DropdownTriggerViewProps>(
  function DropdownTriggerView(props, ref) {
    return <Pressable ref={ref} accessibilityRole="button" {...props} />;
  },
);

export type DropdownContentViewProps = ViewProps & {
  className?: string;
  isOpen: boolean;
};

export const DropdownContentView = forwardRef<RNView, DropdownContentViewProps>(
  function DropdownContentView({ isOpen, ...rest }, ref) {
    if (!isOpen) return null;
    return <View ref={ref} accessibilityRole="menu" {...rest} />;
  },
);

export type DropdownItemState = { selected: boolean; pressed: boolean };

export type DropdownItemViewProps = Omit<PressableProps, 'children'> & {
  className?: string;
  selected: boolean;
  children?: ReactNode | ((state: DropdownItemState) => ReactNode);
};

export const DropdownItemView = forwardRef<RNView, DropdownItemViewProps>(
  function DropdownItemView({ selected, children, ...rest }, ref) {
    return (
      <Pressable ref={ref} accessibilityRole="menuitem" {...rest}>
        {(state) =>
          typeof children === 'function'
            ? children({ selected, pressed: state.pressed })
            : children
        }
      </Pressable>
    );
  },
);
