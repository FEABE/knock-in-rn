import { OnboardingScreenView } from './onboarding-screen.view';
import { useOnboardingScreen } from './use-onboarding-screen';

export function OnboardingScreen() {
  const asks = useOnboardingScreen();
  return <OnboardingScreenView {...asks} />;
}
