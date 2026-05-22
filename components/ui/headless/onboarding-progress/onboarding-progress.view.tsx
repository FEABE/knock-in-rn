import { type ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

import type { UseOnboardingProgressReturn } from './use-onboarding-progress';

export type OnboardingProgressViewProps = Omit<ViewProps, 'children'> &
  UseOnboardingProgressReturn & {
    className?: string;
    children?:
      | ReactNode
      | ((value: UseOnboardingProgressReturn) => ReactNode);
  };

export function OnboardingProgressView({
  current,
  total,
  progress,
  steps,
  children,
  ...rest
}: OnboardingProgressViewProps) {
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current + 1 }}
      {...rest}
    >
      {typeof children === 'function'
        ? children({ current, total, progress, steps })
        : children}
    </View>
  );
}
