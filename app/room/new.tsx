import { Stack } from 'expo-router';

import { NewRoomScreen } from '@/components/room/new-room-screen/new-room-screen';

export default function NewRoomRoute() {
  return (
    <>
      {/* 작성 중 이탈은 확인창을 거쳐야 하므로 iOS 스와이프 뒤로가기는 막는다. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <NewRoomScreen />
    </>
  );
}
