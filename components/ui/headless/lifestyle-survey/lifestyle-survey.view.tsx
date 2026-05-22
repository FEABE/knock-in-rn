import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseLifestyleSurveyReturn } from './use-lifestyle-survey';

export type LifestyleSurveyViewProps = Omit<ViewProps, 'children'> &
  UseLifestyleSurveyReturn & {
    className?: string;
    children: (value: UseLifestyleSurveyReturn) => ReactNode;
  };

export function LifestyleSurveyView({
  children,
  value,
  setField,
  setSleepTime,
  setWakeTime,
  setCleanliness,
  setNoise,
  setSmoking,
  setPet,
  reset,
  isComplete,
  filledCount,
  totalCount,
  progress,
  isDisabled,
  ...rest
}: LifestyleSurveyViewProps) {
  return (
    <View {...rest}>
      {children({
        value,
        setField,
        setSleepTime,
        setWakeTime,
        setCleanliness,
        setNoise,
        setSmoking,
        setPet,
        reset,
        isComplete,
        filledCount,
        totalCount,
        progress,
        isDisabled,
      })}
    </View>
  );
}
