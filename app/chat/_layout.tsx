import { Stack } from 'expo-router';

import { AuthenticatedRoute } from '@/components/auth/authenticated-route';

export default function ChatLayout() {
  return (
    <AuthenticatedRoute
      title="채팅"
      promptTitle="로그인하고 대화를 시작해보세요"
      promptDescription="마음에 드는 룸메이트와 바로 대화를 시작할 수 있어요"
    >
      <Stack screenOptions={{ headerShown: false }} />
    </AuthenticatedRoute>
  );
}
