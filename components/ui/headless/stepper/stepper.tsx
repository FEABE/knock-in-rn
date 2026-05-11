import { forwardRef, type ReactNode } from 'react';
import type { View as RNView } from 'react-native';

import {
  StepperNextView,
  StepperPrevView,
  StepperRootView,
  StepperStepView,
  type StepperButtonViewProps,
} from './stepper.view';
import {
  useStepperNext,
  useStepperPrev,
  useStepperRoot,
  useStepperStep,
  type UseStepperRootProps,
} from './use-stepper';

type RootProps = UseStepperRootProps & { children?: ReactNode };

function Root({ children, ...rest }: RootProps) {
  const value = useStepperRoot(rest);
  return <StepperRootView value={value}>{children}</StepperRootView>;
}

type StepProps = { index: number; children?: ReactNode };

function Step({ index, children }: StepProps) {
  const { active } = useStepperStep(index);
  return <StepperStepView active={active}>{children}</StepperStepView>;
}

type NextProps = Omit<StepperButtonViewProps, 'onPress'>;

const Next = forwardRef<RNView, NextProps>(function Next(props, ref) {
  const asks = useStepperNext();
  return (
    <StepperNextView
      ref={ref}
      onPress={asks.onPress}
      accessibilityLabel={asks.isLast ? '완료' : '다음'}
      {...props}
    />
  );
});

type PrevProps = Omit<StepperButtonViewProps, 'onPress' | 'disabled'>;

const Prev = forwardRef<RNView, PrevProps>(function Prev(props, ref) {
  const asks = useStepperPrev();
  return (
    <StepperPrevView
      ref={ref}
      onPress={asks.onPress}
      disabled={asks.disabled}
      accessibilityLabel="이전"
      {...props}
    />
  );
});

export const Stepper = { Root, Step, Next, Prev };
