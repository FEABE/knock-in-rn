import { Stack } from 'expo-router';

import { AuthenticatedRoute } from '@/components/auth/authenticated-route';

export default function ChatLayout() {
  return (
    <AuthenticatedRoute
      title="채팅"
      promptTitle="로그인하고 대화를 시작해보세요"
      promptDescription="채팅 요청과 룸메이트 대화를 안전하게 이어갈 수 있어요"
    >
      <Stack screenOptions={{ headerShown: false }} />
    </AuthenticatedRoute>
  );
}
