import { LoginScreenView } from './login-screen.view';
import { useLoginScreen } from './use-login-screen';

export function LoginScreen() {
  const asks = useLoginScreen();
  return <LoginScreenView {...asks} />;
}
