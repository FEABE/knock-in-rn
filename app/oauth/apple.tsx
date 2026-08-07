import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';

/**
 * Apple 웹 로그인(안드로이드) 콜백 라우트.
 *
 * 브라우저가 `knockinrn://oauth/apple?...`로 복귀하면 WebBrowser.openAuthSessionAsync가
 * 결과 URL을 받아 로그인 처리를 이어가지만, Expo Router도 같은 딥링크를 화면 이동으로
 * 해석한다. 이 라우트가 없으면 "Unmatched Route" 화면이 뜨므로, 매칭만 받아주고
 * 즉시 이전 화면(로그인)으로 돌아간다. 실제 토큰 처리는 lib/auth/apple-web.ts가 담당한다.
 */
export default function AppleOAuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // 로그인 화면 위에 push된 경우 → pop으로 원래 화면(진행 중인 로그인 상태 유지) 복귀.
    // 딥링크 콜드 스타트로 이 화면이 첫 화면인 경우 → 로그인 화면으로 교체.
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/kakao-login');
    }
  }, [router]);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator color="#256EF4" />
    </View>
  );
}
