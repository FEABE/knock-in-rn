import { ExploreScreenView } from './explore-screen.view';
import { useExploreScreen } from './use-explore-screen';

export function ExploreScreen() {
  const asks = useExploreScreen();
  return <ExploreScreenView {...asks} />;
}
