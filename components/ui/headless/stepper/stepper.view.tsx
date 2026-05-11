import { forwardRef, type ReactNode } from 'react';
import {
  Pressable,
  type PressableProps,
  type View as RNView,
} from 'react-native';

import { StepperContext, type StepperContextValue } from './context';

export type StepperRootViewProps = {
  value: StepperContextValue;
  children?: ReactNode;
};

export function StepperRootView({ value, children }: StepperRootViewProps) {
  return (
    <StepperContext.Provider value={value}>{children}</StepperContext.Provider>
  );
}

export type StepperStepViewProps = {
  active: boolean;
  children?: ReactNode;
};

export function StepperStepView({ active, children }: StepperStepViewProps) {
  if (!active) return null;
  return <>{children}</>;
}

export type StepperButtonViewProps = PressableProps & {
  className?: string;
};

export const StepperNextView = forwardRef<RNView, StepperButtonViewProps>(
  function StepperNextView(props, ref) {
    return <Pressable ref={ref} accessibilityRole="button" {...props} />;
  },
);

export const StepperPrevView = forwardRef<RNView, StepperButtonViewProps>(
  function StepperPrevView(props, ref) {
    return <Pressable ref={ref} accessibilityRole="button" {...props} />;
  },
);
