import { ProfileEditScreenView } from './profile-edit-screen.view';
import { useProfileEditScreen } from './use-profile-edit-screen';

export function ProfileEditScreen() {
  const asks = useProfileEditScreen();
  return <ProfileEditScreenView {...asks} />;
}
