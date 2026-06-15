import { AgreementScreenView } from './agreement-screen.view';
import { useAgreementScreen } from './use-agreement-screen';

export function AgreementScreen() {
  const asks = useAgreementScreen();
  return <AgreementScreenView {...asks} />;
}
