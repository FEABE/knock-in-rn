import { useOnboarding } from '@/lib/onboarding';

export type UseOnboardingScreenReturn = {
  currentStep: ReturnType<typeof useOnboarding>['currentStep'];
};

export function useOnboardingScreen(): UseOnboardingScreenReturn {
  const { currentStep } = useOnboarding();
  return { currentStep };
}
