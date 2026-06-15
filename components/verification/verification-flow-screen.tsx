import { VerificationFlowScreenView } from './verification-flow-screen.view';
import {
  useVerificationFlowScreen,
  type UseVerificationFlowScreenProps,
} from './use-verification-flow-screen';

export type VerificationFlowScreenProps = UseVerificationFlowScreenProps;

export function VerificationFlowScreen(props: VerificationFlowScreenProps) {
  const asks = useVerificationFlowScreen(props);
  return <VerificationFlowScreenView {...asks} />;
}
