import {
  OnboardingProgressView,
  type OnboardingProgressViewProps,
} from './onboarding-progress.view';
import {
  useOnboardingProgress,
  type UseOnboardingProgressProps,
} from './use-onboarding-progress';

export type OnboardingProgressProps = UseOnboardingProgressProps &
  Omit<
    OnboardingProgressViewProps,
    keyof ReturnType<typeof useOnboardingProgress>
  >;

export function OnboardingProgress({
  steps,
  current,
  ...rest
}: OnboardingProgressProps) {
  const asks = useOnboardingProgress({ steps, current });
  return <OnboardingProgressView {...asks} {...rest} />;
}
