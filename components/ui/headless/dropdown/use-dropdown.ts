import { useCallback, useMemo } from 'react';
import type { AccessibilityState } from 'react-native';

import { useControllableState } from '../use-controllable-state';
import { useDisclosure } from '../use-disclosure';
import type { DropdownContextValue } from './context';
import { useDropdownContext } from './context';

export type UseDropdownRootProps = {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
};

export function useDropdownRoot({
  open,
  defaultOpen,
  onOpenChange,
  value,
  defaultValue,
  onValueChange,
}: UseDropdownRootProps): DropdownContextValue {
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure({
    open,
    defaultOpen,
    onOpenChange,
  });

  const [selectedValue, setSelectedValue] = useControllableState<string>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  return useMemo<DropdownContextValue>(
    () => ({
      isOpen,
      onOpen,
      onClose,
      onToggle,
      selectedValue,
      setSelectedValue: (next: string) => {
        setSelectedValue(next);
        onClose();
      },
    }),
    [isOpen, onOpen, onClose, onToggle, selectedValue, setSelectedValue],
  );
}

export function useDropdownTrigger() {
  const { onToggle, isOpen } = useDropdownContext('Dropdown.Trigger');
  return {
    onPress: onToggle,
    accessibilityState: { expanded: isOpen } as AccessibilityState,
  };
}

export function useDropdownContent() {
  const { isOpen } = useDropdownContext('Dropdown.Content');
  return { isOpen };
}

export type UseDropdownItemProps = {
  value: string;
  onSelect?: (value: string) => void;
};

export function useDropdownItem({ value, onSelect }: UseDropdownItemProps) {
  const { selectedValue, setSelectedValue } = useDropdownContext(
    'Dropdown.Item',
  );
  const selected = selectedValue === value;

  const onPress = useCallback(() => {
    setSelectedValue(value);
    onSelect?.(value);
  }, [value, setSelectedValue, onSelect]);

  return {
    onPress,
    selected,
    accessibilityState: { selected } as AccessibilityState,
  };
}
