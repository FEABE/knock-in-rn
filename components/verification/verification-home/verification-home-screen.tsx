import { VerificationHomeScreenView } from './verification-home-screen.view';
import { useVerificationHomeScreen } from './use-verification-home-screen';

export function VerificationHomeScreen() {
  const asks = useVerificationHomeScreen();
  return <VerificationHomeScreenView {...asks} />;
}
