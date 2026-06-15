import { InquiryFormScreenView } from './inquiry-form-screen.view';
import { useInquiryFormScreen } from './use-inquiry-form-screen';

export function InquiryFormScreen() {
  const asks = useInquiryFormScreen();
  return <InquiryFormScreenView {...asks} />;
}
