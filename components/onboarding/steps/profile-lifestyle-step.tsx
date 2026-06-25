import { ProfileLifestyleStepView } from './profile-lifestyle-step.view';
import { useProfileLifestyleStep } from './use-profile-lifestyle-step';

export function ProfileLifestyleStep() {
  const asks = useProfileLifestyleStep();
  return <ProfileLifestyleStepView {...asks} />;
}
