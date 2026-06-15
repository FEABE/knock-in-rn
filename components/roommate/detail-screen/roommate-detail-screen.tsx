import { RoommateDetailScreenView } from './roommate-detail-screen.view';
import { useRoommateDetailScreen } from './use-roommate-detail-screen';

export function RoommateDetailScreen() {
  const asks = useRoommateDetailScreen();
  return <RoommateDetailScreenView {...asks} />;
}
