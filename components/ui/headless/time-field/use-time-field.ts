import { useCallback, useMemo } from 'react';

import { useControllableState } from '../use-controllable-state';
import { useDisclosure } from '../use-disclosure';

export type TimeValue = { hours: number; minutes: number };

export type UseTimeFieldProps = {
  value?: TimeValue | null;
  defaultValue?: TimeValue | null;
  onValueChange?: (value: TimeValue | null) => void;
  disabled?: boolean;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  minuteStep?: number;
  format?: (value: TimeValue) => string;
};

export type UseTimeFieldReturn = {
  value: TimeValue | null;
  setValue: (next: TimeValue | null) => void;
  setHours: (hours: number) => void;
  setMinutes: (minutes: number) => void;
  display: string;
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  isDisabled: boolean;
  minuteStep: number;
};

const defaultFormat = (t: TimeValue) =>
  `${String(t.hours).padStart(2, '0')}:${String(t.minutes).padStart(2, '0')}`;

function normalize(t: TimeValue, minuteStep: number): TimeValue {
  const hours = Math.min(23, Math.max(0, Math.round(t.hours)));
  const stepped =
    Math.round(Math.min(59, Math.max(0, t.minutes)) / minuteStep) * minuteStep;
  return { hours, minutes: Math.min(59, stepped) };
}

export function useTimeField({
  value,
  defaultValue = null,
  onValueChange,
  disabled,
  open,
  defaultOpen,
  onOpenChange,
  minuteStep = 1,
  format = defaultFormat,
}: UseTimeFieldProps): UseTimeFieldReturn {
  const [current, setInternal] = useControllableState<TimeValue | null>({
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
    (next: TimeValue | null) => {
      if (next === null) {
        setInternal(null);
        return;
      }
      setInternal(normalize(next, minuteStep));
    },
    [setInternal, minuteStep],
  );

  const setHours = useCallback(
    (hours: number) => {
      const base = current ?? { hours: 0, minutes: 0 };
      setValue({ ...base, hours });
    },
    [current, setValue],
  );

  const setMinutes = useCallback(
    (minutes: number) => {
      const base = current ?? { hours: 0, minutes: 0 };
      setValue({ ...base, minutes });
    },
    [current, setValue],
  );

  const display = useMemo(
    () => (current ? format(current) : ''),
    [current, format],
  );

  return {
    value: current ?? null,
    setValue,
    setHours,
    setMinutes,
    display,
    isOpen,
    onOpen,
    onClose,
    onToggle,
    isDisabled: !!disabled,
    minuteStep,
  };
}
