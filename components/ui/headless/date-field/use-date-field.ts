import { useCallback, useMemo } from 'react';

import { useControllableState } from '../use-controllable-state';
import { useDisclosure } from '../use-disclosure';

export type UseDateFieldProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  min?: Date;
  max?: Date;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  format?: (date: Date) => string;
};

export type UseDateFieldReturn = {
  value: Date | null;
  setValue: (next: Date | null) => void;
  display: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  isDisabled: boolean;
  min?: Date;
  max?: Date;
};

const defaultFormat = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

function clamp(value: Date, min?: Date, max?: Date): Date {
  if (min && value < min) return min;
  if (max && value > max) return max;
  return value;
}

export function useDateField({
  value,
  defaultValue = null,
  onValueChange,
  min,
  max,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  format = defaultFormat,
}: UseDateFieldProps): UseDateFieldReturn {
  const [current, setInternal] = useControllableState<Date | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure({
    open,
    defaultOpen,
    onOpenChange,
  });

  const setValue = useCallback(
    (next: Date | null) => {
      if (next === null) {
        setInternal(null);
        return;
      }
      setInternal(clamp(next, min, max));
    },
    [setInternal, min, max],
  );

  const display = useMemo(
    () => (current ? format(current) : ''),
    [current, format],
  );

  return {
    value: current ?? null,
    setValue,
    display,
    isOpen,
    onOpen,
    onClose,
    onToggle,
    isDisabled: !!disabled,
    min,
    max,
  };
}
