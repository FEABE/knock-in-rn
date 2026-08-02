import { BasicProfileEditScreenView } from './basic-profile-edit-screen.view';
import { useBasicProfileEditScreen } from './use-basic-profile-edit-screen';

export function BasicProfileEditScreen() {
  return <BasicProfileEditScreenView {...useBasicProfileEditScreen()} />;
}
