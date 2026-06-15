import { BlockedListScreenView } from './blocked-list-screen.view';
import { useBlockedListScreen } from './use-blocked-list-screen';

export function BlockedListScreen() {
  const asks = useBlockedListScreen();
  return <BlockedListScreenView {...asks} />;
}
