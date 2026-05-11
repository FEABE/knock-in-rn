import { createContext, useContext } from 'react';

export type ModalContextValue = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const ModalContext = createContext<ModalContextValue | null>(null);

export function useModalContext(component: string): ModalContextValue {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    throw new Error(`<${component}> must be used inside <Modal.Root>`);
  }
  return ctx;
}
