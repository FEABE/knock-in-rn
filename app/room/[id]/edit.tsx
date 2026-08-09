import { Stack } from 'expo-router';

import { EditRoomScreen } from '@/components/room/edit-room-screen/edit-room-screen';
import { AuthenticatedRoute } from '@/components/auth/authenticated-route';

export default function EditRoomRoute() {
  return (
    <AuthenticatedRoute
      title="방 수정"
      promptTitle="로그인 후 등록한 방을 수정할 수 있어요"
      promptDescription="내가 등록한 게시글만 안전하게 수정할 수 있어요"
    >
      {/* 수정 중 이탈은 확인창을 거쳐야 하므로 iOS 스와이프 뒤로가기는 막는다. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <EditRoomScreen />
    </AuthenticatedRoute>
  );
}
