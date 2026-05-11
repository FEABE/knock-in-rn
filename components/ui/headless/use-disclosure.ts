import { useCallback } from 'react';

import { useControllableState } from './use-controllable-state';

type UseDisclosureProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function useDisclosure({
  open,
  defaultOpen = false,
  onOpenChange,
}: UseDisclosureProps = {}) {
  const [isOpen, setOpen] = useControllableState<boolean>({
    value: open,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });

  const onOpen = useCallback(() => setOpen(true), [setOpen]);
  const onClose = useCallback(() => setOpen(false), [setOpen]);
  const onToggle = useCallback(() => setOpen(!isOpen), [isOpen, setOpen]);

  return { isOpen: !!isOpen, onOpen, onClose, onToggle, setOpen };
}
