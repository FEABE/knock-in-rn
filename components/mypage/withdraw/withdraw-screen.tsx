import { WithdrawScreenView } from './withdraw-screen.view';
import { useWithdrawScreen } from './use-withdraw-screen';

export function WithdrawScreen() {
  const asks = useWithdrawScreen();
  return <WithdrawScreenView {...asks} />;
}
