import { TermsScreenView } from './terms-screen.view';
import { useTermsScreen } from './use-terms-screen';

export function TermsScreen() {
  const asks = useTermsScreen();
  return <TermsScreenView {...asks} />;
}
