import { useCallback, useMemo } from 'react';

import type {
  CleanlinessLevel,
  Lifestyle,
  NoiseSensitivity,
  PetPolicy,
  Smoking,
} from '@/lib/onboarding';
import { isLifestyleComplete } from '@/lib/onboarding';

import { useControllableState } from '../use-controllable-state';

export type UseLifestyleSurveyProps = {
  value?: Partial<Lifestyle>;
  defaultValue?: Partial<Lifestyle>;
  onValueChange?: (value: Partial<Lifestyle>) => void;
  disabled?: boolean;
};

export type LifestyleFieldKey = keyof Lifestyle;

export type UseLifestyleSurveyReturn = {
  value: Partial<Lifestyle>;
  setField: <K extends LifestyleFieldKey>(key: K, next: Lifestyle[K]) => void;
  setSleepTime: (v: string) => void;
  setWakeTime: (v: string) => void;
  setCleanliness: (v: CleanlinessLevel) => void;
  setNoise: (v: NoiseSensitivity) => void;
  setSmoking: (v: Smoking) => void;
  setPet: (v: PetPolicy) => void;
  reset: () => void;
  isComplete: boolean;
  filledCount: number;
  totalCount: number;
  progress: number;
  isDisabled: boolean;
};

const ALL_FIELDS: LifestyleFieldKey[] = [
  'sleepTime',
  'wakeTime',
  'cleanliness',
  'noise',
  'smoking',
  'pet',
];

export function useLifestyleSurvey({
  value,
  defaultValue = {},
  onValueChange,
  disabled,
}: UseLifestyleSurveyProps = {}): UseLifestyleSurveyReturn {
  const [current, setCurrent] = useControllableState<Partial<Lifestyle>>({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const map = current ?? {};

  const setField = useCallback(
    <K extends LifestyleFieldKey>(key: K, next: Lifestyle[K]) => {
      if (disabled) return;
      setCurrent({ ...map, [key]: next });
    },
    [map, setCurrent, disabled],
  );

  const reset = useCallback(() => setCurrent({}), [setCurrent]);

  const filledCount = ALL_FIELDS.filter((k) => map[k] !== undefined && map[k] !== '').length;

  return useMemo<UseLifestyleSurveyReturn>(
    () => ({
      value: map,
      setField,
      setSleepTime: (v) => setField('sleepTime', v),
      setWakeTime: (v) => setField('wakeTime', v),
      setCleanliness: (v) => setField('cleanliness', v),
      setNoise: (v) => setField('noise', v),
      setSmoking: (v) => setField('smoking', v),
      setPet: (v) => setField('pet', v),
      reset,
      isComplete: isLifestyleComplete(map),
      filledCount,
      totalCount: ALL_FIELDS.length,
      progress: filledCount / ALL_FIELDS.length,
      isDisabled: !!disabled,
    }),
    [map, setField, reset, filledCount, disabled],
  );
}
