import { Stack } from 'expo-router';

import { AuthenticatedRoute } from '@/components/auth/authenticated-route';

export default function MyPageStackLayout() {
  return (
    <AuthenticatedRoute
      title="마이페이지"
      promptTitle="로그인 후 내 정보를 관리할 수 있어요"
      promptDescription="프로필, 선호 조건, 계정 설정을 안전하게 확인하고 수정해보세요"
    >
      <Stack screenOptions={{ headerShown: false }} />
    </AuthenticatedRoute>
  );
}
