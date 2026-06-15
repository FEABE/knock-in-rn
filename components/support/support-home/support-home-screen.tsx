import { SupportHomeScreenView } from './support-home-screen.view';
import { useSupportHomeScreen } from './use-support-home-screen';

export function SupportHomeScreen() {
  const asks = useSupportHomeScreen();
  return <SupportHomeScreenView {...asks} />;
}
