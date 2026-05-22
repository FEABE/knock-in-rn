import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type View as RNView,
  type ViewProps,
} from 'react-native';

import { TabsContext, type TabsContextValue } from './context';
import type { UseTabsTriggerReturn } from './use-tabs';

export type TabsRootViewProps = ViewProps & {
  value: TabsContextValue;
  className?: string;
  children?: ReactNode;
};

export const TabsRootView = forwardRef<RNView, TabsRootViewProps>(
  function TabsRootView({ value, children, ...rest }, ref) {
    return (
      <TabsContext.Provider value={value}>
        <View ref={ref} {...rest}>
          {children}
        </View>
      </TabsContext.Provider>
    );
  },
);

export type TabsListViewProps = ViewProps & {
  className?: string;
  children?: ReactNode;
};

export const TabsListView = forwardRef<RNView, TabsListViewProps>(
  function TabsListView(props, ref) {
    return <View ref={ref} accessibilityRole="tablist" {...props} />;
  },
);

export type TabsTriggerState = {
  selected: boolean;
  disabled: boolean;
  pressed: boolean;
};

export type TabsTriggerViewProps = Omit<
  PressableProps,
  'onPress' | 'children' | 'disabled'
> &
  UseTabsTriggerReturn & {
    className?: string;
    children?: ReactNode | ((state: TabsTriggerState) => ReactNode);
  };

export const TabsTriggerView = forwardRef<RNView, TabsTriggerViewProps>(
  function TabsTriggerView(
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

export type TabsContentViewProps = ViewProps & {
  isActive: boolean;
  className?: string;
  children?: ReactNode;
};

export const TabsContentView = forwardRef<RNView, TabsContentViewProps>(
  function TabsContentView({ isActive, children, ...rest }, ref) {
    if (!isActive) return null;
    return (
      <View ref={ref} accessibilityRole="none" {...rest}>
        {children}
      </View>
    );
  },
);
