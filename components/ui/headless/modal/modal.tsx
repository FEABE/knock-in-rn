import { forwardRef, type ReactNode } from 'react';
import type { View as RNView } from 'react-native';

import {
  ModalBackdropView,
  ModalCloseView,
  ModalContentView,
  ModalPortalView,
  ModalRootView,
  ModalTriggerView,
  type ModalPortalViewProps,
  type ModalPressableViewProps,
} from './modal.view';
import {
  useModalBackdrop,
  useModalClose,
  useModalPortal,
  useModalRoot,
  useModalTrigger,
  type UseModalRootProps,
} from './use-modal';

type RootProps = UseModalRootProps & { children?: ReactNode };

function Root({ open, defaultOpen, onOpenChange, children }: RootProps) {
  const value = useModalRoot({ open, defaultOpen, onOpenChange });
  return <ModalRootView value={value}>{children}</ModalRootView>;
}

type TriggerProps = Omit<ModalPressableViewProps, 'onPress'>;

const Trigger = forwardRef<RNView, TriggerProps>(function Trigger(props, ref) {
  const asks = useModalTrigger();
  return <ModalTriggerView ref={ref} {...asks} {...props} />;
});

type CloseProps = Omit<ModalPressableViewProps, 'onPress'>;

const Close = forwardRef<RNView, CloseProps>(function Close(props, ref) {
  const asks = useModalClose();
  return <ModalCloseView ref={ref} {...asks} {...props} />;
});

type PortalProps = Omit<
  ModalPortalViewProps,
  'visible' | 'onRequestClose'
>;

function Portal(props: PortalProps) {
  const asks = useModalPortal();
  return <ModalPortalView {...asks} {...props} />;
}

type BackdropProps = Omit<ModalPressableViewProps, 'onPress'>;

const Backdrop = forwardRef<RNView, BackdropProps>(function Backdrop(
  props,
  ref,
) {
  const asks = useModalBackdrop();
  return <ModalBackdropView ref={ref} {...asks} {...props} />;
});

export const Modal = {
  Root,
  Trigger,
  Close,
  Portal,
  Backdrop,
  Content: ModalContentView,
};
