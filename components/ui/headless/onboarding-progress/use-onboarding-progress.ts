import { useMemo } from 'react';

export type OnboardingStepState = {
  index: number;
  label: string;
  active: boolean;
  completed: boolean;
};

export type UseOnboardingProgressProps = {
  steps: readonly string[];
  current: number;
};

export type UseOnboardingProgressReturn = {
  current: number;
  total: number;
  progress: number;
  steps: OnboardingStepState[];
};

export function useOnboardingProgress({
  steps,
  current,
}: UseOnboardingProgressProps): UseOnboardingProgressReturn {
  const total = steps.length;
  const clamped = Math.min(Math.max(current, 0), Math.max(total - 1, 0));
  const last = Math.max(total - 1, 0);

  const mapped = useMemo<OnboardingStepState[]>(
    () =>
      steps.map((label, index) => ({
        index,
        label,
        active: index === clamped,
        completed: index < clamped,
      })),
    [steps, clamped],
  );

  const progress = total <= 1 ? 1 : clamped / last;

  return {
    current: clamped,
    total,
    progress,
    steps: mapped,
  };
}
