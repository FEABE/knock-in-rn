import { InterestsScreenView } from './interests-screen.view';
import { useInterestsScreen } from './use-interests-screen';

export function InterestsScreen() {
  const asks = useInterestsScreen();
  return <InterestsScreenView {...asks} />;
}
