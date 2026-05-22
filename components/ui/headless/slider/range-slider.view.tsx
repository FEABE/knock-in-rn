import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseRangeSliderReturn } from './use-range-slider';

export type RangeSliderViewProps = Omit<ViewProps, 'children'> &
  UseRangeSliderReturn & {
    className?: string;
    children: (value: UseRangeSliderReturn) => ReactNode;
  };

export function RangeSliderView({
  value,
  setStart,
  setEnd,
  setValue,
  percents,
  min,
  max,
  step,
  isDisabled,
  children,
  ...rest
}: RangeSliderViewProps) {
  return (
    <View
      accessibilityRole="adjustable"
      accessibilityValue={{ min, max, now: value[0] }}
      {...rest}
    >
      {children({
        value,
        setStart,
        setEnd,
        setValue,
        percents,
        min,
        max,
        step,
        isDisabled,
      })}
    </View>
  );
}
