import { InquiryListScreenView } from './inquiry-list-screen.view';
import { useInquiryListScreen } from './use-inquiry-list-screen';

export function InquiryListScreen() {
  const asks = useInquiryListScreen();
  return <InquiryListScreenView {...asks} />;
}
