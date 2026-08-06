import { InquiryDetailScreenView } from './inquiry-detail-screen.view';
import { useInquiryDetailScreen } from './use-inquiry-detail-screen';

export function InquiryDetailScreen() {
  const asks = useInquiryDetailScreen();
  return <InquiryDetailScreenView {...asks} />;
}
