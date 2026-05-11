import { useMemo } from 'react';

import { useDisclosure } from '../use-disclosure';
import type { ModalContextValue } from './context';
import { useModalContext } from './context';

export type UseModalRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function useModalRoot({
  open,
  defaultOpen,
  onOpenChange,
}: UseModalRootProps): ModalContextValue {
  const { isOpen, onOpen, onClose } = useDisclosure({
    open,
    defaultOpen,
    onOpenChange,
  });

  return useMemo(
    () => ({ isOpen, onOpen, onClose }),
    [isOpen, onOpen, onClose],
  );
}

export function useModalTrigger() {
  const { onOpen } = useModalContext('Modal.Trigger');
  return { onPress: onOpen };
}

export function useModalClose() {
  const { onClose } = useModalContext('Modal.Close');
  return { onPress: onClose };
}

export function useModalPortal() {
  const { isOpen, onClose } = useModalContext('Modal.Portal');
  return { visible: isOpen, onRequestClose: onClose };
}

export function useModalBackdrop() {
  const { onClose } = useModalContext('Modal.Backdrop');
  return { onPress: onClose };
}
