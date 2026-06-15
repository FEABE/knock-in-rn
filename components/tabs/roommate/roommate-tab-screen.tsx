import { RoommateTabScreenView } from './roommate-tab-screen.view';
import { useRoommateTabScreen } from './use-roommate-tab-screen';

export function RoommateTabScreen() {
  const asks = useRoommateTabScreen();
  return <RoommateTabScreenView {...asks} />;
}
