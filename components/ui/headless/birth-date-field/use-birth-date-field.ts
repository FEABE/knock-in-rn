import { useCallback, useMemo, useRef, useState } from 'react';
import type { TextInput } from 'react-native';

import { useControllableState } from '../use-controllable-state';

export type BirthDateParts = {
  year: string;
  month: string;
  day: string;
};

export type UseBirthDateFieldProps = {
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (value: Date | null) => void;
  minYear?: number;
  maxYear?: number;
  disabled?: boolean;
};

export type BirthDatePartHandlers = {
  value: string;
  onChangeText: (text: string) => void;
  ref: (node: TextInput | null) => void;
  maxLength: number;
  keyboardType: 'number-pad';
  placeholder: string;
};

export type UseBirthDateFieldReturn = {
  parts: BirthDateParts;
  date: Date | null;
  isComplete: boolean;
  isValid: boolean;
  isDisabled: boolean;
  yearField: BirthDatePartHandlers;
  monthField: BirthDatePartHandlers;
  dayField: BirthDatePartHandlers;
  reset: () => void;
};

function partsToDate(parts: BirthDateParts): Date | null {
  const y = Number(parts.year);
  const m = Number(parts.month);
  const d = Number(parts.day);
  if (!parts.year || !parts.month || !parts.day) return null;
  if (Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d)) return null;
  const date = new Date(y, m - 1, d);
  if (
    date.getFullYear() !== y ||
    date.getMonth() !== m - 1 ||
    date.getDate() !== d
  ) {
    return null;
  }
  return date;
}

function dateToParts(date: Date | null | undefined): BirthDateParts {
  if (!date) return { year: '', month: '', day: '' };
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0'),
  };
}

const numericOnly = (s: string) => s.replace(/\D/g, '');

export function useBirthDateField({
  value,
  defaultValue = null,
  onValueChange,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  disabled,
}: UseBirthDateFieldProps = {}): UseBirthDateFieldReturn {
  const [controlled, setControlled] = useControllableState<Date | null>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const [parts, setParts] = useState<BirthDateParts>(() =>
    dateToParts(controlled),
  );

  const monthRef = useRef<TextInput | null>(null);
  const dayRef = useRef<TextInput | null>(null);
  const yearRef = useRef<TextInput | null>(null);

  const update = useCallback(
    (next: BirthDateParts) => {
      setParts(next);
      const date = partsToDate(next);
      if (date) {
        if (date.getFullYear() < minYear || date.getFullYear() > maxYear) {
          setControlled(null);
          return;
        }
        setControlled(date);
      } else if (controlled !== null) {
        setControlled(null);
      }
    },
    [controlled, maxYear, minYear, setControlled],
  );

  const onChangeYear = useCallback(
    (text: string) => {
      const clean = numericOnly(text).slice(0, 4);
      const next = { ...parts, year: clean };
      update(next);
      if (clean.length === 4) monthRef.current?.focus();
    },
    [parts, update],
  );

  const onChangeMonth = useCallback(
    (text: string) => {
      const clean = numericOnly(text).slice(0, 2);
      const next = { ...parts, month: clean };
      update(next);
      if (clean.length === 2) dayRef.current?.focus();
    },
    [parts, update],
  );

  const onChangeDay = useCallback(
    (text: string) => {
      const clean = numericOnly(text).slice(0, 2);
      const next = { ...parts, day: clean };
      update(next);
    },
    [parts, update],
  );

  const reset = useCallback(() => {
    setParts({ year: '', month: '', day: '' });
    setControlled(null);
  }, [setControlled]);

  const isComplete =
    parts.year.length === 4 &&
    parts.month.length >= 1 &&
    parts.day.length >= 1;

  const isValid = controlled !== null;

  return useMemo<UseBirthDateFieldReturn>(
    () => ({
      parts,
      date: controlled ?? null,
      isComplete,
      isValid,
      isDisabled: !!disabled,
      yearField: {
        value: parts.year,
        onChangeText: onChangeYear,
        ref: (n) => {
          yearRef.current = n;
        },
        maxLength: 4,
        keyboardType: 'number-pad',
        placeholder: 'YYYY',
      },
      monthField: {
        value: parts.month,
        onChangeText: onChangeMonth,
        ref: (n) => {
          monthRef.current = n;
        },
        maxLength: 2,
        keyboardType: 'number-pad',
        placeholder: 'MM',
      },
      dayField: {
        value: parts.day,
        onChangeText: onChangeDay,
        ref: (n) => {
          dayRef.current = n;
        },
        maxLength: 2,
        keyboardType: 'number-pad',
        placeholder: 'DD',
      },
      reset,
    }),
    [
      parts,
      controlled,
      isComplete,
      isValid,
      disabled,
      onChangeYear,
      onChangeMonth,
      onChangeDay,
      reset,
    ],
  );
}
