import { FaqScreenView } from './faq-screen.view';
import { useFaqScreen } from './use-faq-screen';

export function FaqScreen() {
  const asks = useFaqScreen();
  return <FaqScreenView {...asks} />;
}
