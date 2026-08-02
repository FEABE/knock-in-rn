import { InquiryListScreen } from '@/components/support/inquiry-list/inquiry-list-screen';
import { AuthenticatedRoute } from '@/components/auth/authenticated-route';

export default function InquiryListRoute() {
  return (
    <AuthenticatedRoute
      title="문의내역"
      promptTitle="로그인 후 문의내역을 확인할 수 있어요"
      promptDescription="접수한 문의와 운영팀 답변을 안전하게 확인해보세요"
    >
      <InquiryListScreen />
    </AuthenticatedRoute>
  );
}
