import { AuthenticatedRoute } from '@/components/auth/authenticated-route';
import { RoommateDetailScreen } from '@/components/roommate/detail-screen/roommate-detail-screen';

export default function RoommateDetailRoute() {
  return (
    <AuthenticatedRoute
      title="룸메이트 상세"
      promptTitle="로그인 후 룸메이트 정보를 볼 수 있어요"
      promptDescription="궁합 정보와 채팅 요청은 로그인한 회원에게만 제공돼요"
    >
      <RoommateDetailScreen />
    </AuthenticatedRoute>
  );
}
