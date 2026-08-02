import { InquiryFormScreen } from '@/components/support/inquiry-form/inquiry-form-screen';
import { AuthenticatedRoute } from '@/components/auth/authenticated-route';

export default function InquiryNewRoute() {
  return (
    <AuthenticatedRoute
      title="문의하기"
      promptTitle="로그인 후 문의를 남길 수 있어요"
      promptDescription="계정과 문의 답변을 연결하려면 로그인이 필요해요"
    >
      <InquiryFormScreen />
    </AuthenticatedRoute>
  );
}
