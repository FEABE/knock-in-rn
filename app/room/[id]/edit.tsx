import { EditRoomScreen } from '@/components/room/edit-room-screen/edit-room-screen';
import { AuthenticatedRoute } from '@/components/auth/authenticated-route';

export default function EditRoomRoute() {
  return (
    <AuthenticatedRoute
      title="방 수정"
      promptTitle="로그인 후 등록한 방을 수정할 수 있어요"
      promptDescription="내가 등록한 게시글만 안전하게 수정할 수 있어요"
    >
      <EditRoomScreen />
    </AuthenticatedRoute>
  );
}
