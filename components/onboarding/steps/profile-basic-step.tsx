import { ProfileBasicStepView } from './profile-basic-step.view';
import { useProfileBasicStep } from './use-profile-basic-step';

export function ProfileBasicStep() {
  const asks = useProfileBasicStep();
  return <ProfileBasicStepView {...asks} />;
}
