import { AuthenticatedRoute } from '@/components/auth/authenticated-route';
import { RoomDetailScreen } from '@/components/room/detail-screen/room-detail-screen';

export default function RoomDetailRoute() {
  return (
    <AuthenticatedRoute
      title="방 상세"
      promptTitle="로그인 후 방 정보를 자세히 볼 수 있어요"
      promptDescription="관심 등록과 채팅도 로그인 후 안전하게 이용할 수 있어요"
    >
      <RoomDetailScreen />
    </AuthenticatedRoute>
  );
}
