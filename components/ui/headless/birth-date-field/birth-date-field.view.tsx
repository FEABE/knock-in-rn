import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseBirthDateFieldReturn } from './use-birth-date-field';

export type BirthDateFieldViewProps = Omit<ViewProps, 'children'> &
  UseBirthDateFieldReturn & {
    className?: string;
    children: (value: UseBirthDateFieldReturn) => ReactNode;
  };

export function BirthDateFieldView({
  parts,
  date,
  isComplete,
  isValid,
  isDisabled,
  yearField,
  monthField,
  dayField,
  reset,
  children,
  ...rest
}: BirthDateFieldViewProps) {
  return (
    <View {...rest}>
      {children({
        parts,
        date,
        isComplete,
        isValid,
        isDisabled,
        yearField,
        monthField,
        dayField,
        reset,
      })}
    </View>
  );
}
