import { RoommateManagementScreenView } from './roommate-management-screen.view';
import { useRoommateManagementScreen } from './use-roommate-management-screen';

export function RoommateManagementScreen() {
  return <RoommateManagementScreenView {...useRoommateManagementScreen()} />;
}
