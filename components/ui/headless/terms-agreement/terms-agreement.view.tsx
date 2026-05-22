import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type View as RNView,
  type ViewProps,
} from 'react-native';

import {
  TermsAgreementContext,
  type TermsAgreementContextValue,
} from './context';
import type {
  UseTermsAgreementItemReturn,
  UseTermsAgreementToggleAllReturn,
} from './use-terms-agreement';

export type TermsAgreementRootViewProps = ViewProps & {
  value: TermsAgreementContextValue;
  className?: string;
  children?: ReactNode;
};

export const TermsAgreementRootView = forwardRef<
  RNView,
  TermsAgreementRootViewProps
>(function TermsAgreementRootView({ value, children, ...rest }, ref) {
  return (
    <TermsAgreementContext.Provider value={value}>
      <View ref={ref} {...rest}>
        {children}
      </View>
    </TermsAgreementContext.Provider>
  );
});

export type TermsAgreementItemState = {
  checked: boolean;
  disabled: boolean;
  pressed: boolean;
  required: boolean;
  label: string;
  href?: string;
};

export type TermsAgreementItemViewProps = Omit<
  PressableProps,
  'onPress' | 'children' | 'disabled'
> &
  UseTermsAgreementItemReturn & {
    className?: string;
    children?: ReactNode | ((state: TermsAgreementItemState) => ReactNode);
  };

export const TermsAgreementItemView = forwardRef<
  RNView,
  TermsAgreementItemViewProps
>(function TermsAgreementItemView(
  {
    term,
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
              required: term.required,
              label: term.label,
              href: term.href,
            })
          : children
      }
    </Pressable>
  );
});

export type TermsAgreementToggleAllViewProps = Omit<
  PressableProps,
  'onPress' | 'children' | 'disabled'
> &
  UseTermsAgreementToggleAllReturn & {
    className?: string;
    children?: ReactNode | ((state: { checked: boolean; disabled: boolean; pressed: boolean }) => ReactNode);
  };

export const TermsAgreementToggleAllView = forwardRef<
  RNView,
  TermsAgreementToggleAllViewProps
>(function TermsAgreementToggleAllView(
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
