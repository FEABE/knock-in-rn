import { forwardRef, type ReactNode } from 'react';
import {
  Modal as RNModal,
  Pressable,
  View,
  type ModalProps as RNModalProps,
  type PressableProps,
  type View as RNView,
  type ViewProps,
} from 'react-native';

import { ModalContext, type ModalContextValue } from './context';

export type ModalRootViewProps = {
  value: ModalContextValue;
  children?: ReactNode;
};

export function ModalRootView({ value, children }: ModalRootViewProps) {
  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

export type ModalPressableViewProps = PressableProps & {
  className?: string;
};

export const ModalTriggerView = forwardRef<RNView, ModalPressableViewProps>(
  function ModalTriggerView(props, ref) {
    return <Pressable ref={ref} {...props} />;
  },
);

export const ModalCloseView = forwardRef<RNView, ModalPressableViewProps>(
  function ModalCloseView(props, ref) {
    return <Pressable ref={ref} {...props} />;
  },
);

export const ModalBackdropView = forwardRef<RNView, ModalPressableViewProps>(
  function ModalBackdropView(props, ref) {
    return <Pressable ref={ref} {...props} />;
  },
);

export type ModalPortalViewProps = Omit<RNModalProps, 'transparent'> & {
  children?: ReactNode;
};

export function ModalPortalView({
  animationType = 'fade',
  children,
  ...rest
}: ModalPortalViewProps) {
  return (
    <RNModal animationType={animationType} transparent {...rest}>
      {children}
    </RNModal>
  );
}

export const ModalContentView = forwardRef<
  RNView,
  ViewProps & { className?: string }
>(function ModalContentView(props, ref) {
  return <View ref={ref} accessibilityViewIsModal {...props} />;
});
