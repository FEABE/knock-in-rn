import '../global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, type ErrorBoundaryProps } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { ScreenViewTracker } from '@/lib/analytics/screen-tracker';
import { AlarmRealtimeBridge } from '@/components/notifications/alarm-realtime-bridge';
import { PushNotificationBridge } from '@/components/notifications/push-notification-bridge';
import { AgreementProvider, ModerationProvider, SessionProvider } from '@/lib/domain';
import { AppVersionGate } from '@/components/app-version/app-version-gate';
import { LoginRequiredModalProvider } from '@/components/auth/login-required-modal-provider';
import { ErrorFallback } from '@/components/error/error-fallback';

const queryClient = new QueryClient();

export const unstable_settings = {
  anchor: '(tabs)',
};

// expo-router 관례: 라우트 파일의 named export ErrorBoundary가 해당 하위 트리의 폴백이 된다.
export function ErrorBoundary(props: ErrorBoundaryProps) {
  return <ErrorFallback {...props} />;
}

// 다크모드 미지원 — 시스템 설정과 무관하게 라이트 테마로 고정한다.
export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={DefaultTheme}>
        <SessionProvider>
          <LoginRequiredModalProvider>
            <AlarmRealtimeBridge />
            <PushNotificationBridge />
            <ModerationProvider>
              <AgreementProvider>
                {/* 화면 체류 시간 자동 수집 (Firebase screen_view) */}
                <ScreenViewTracker />
                {/* 모든 화면이 자체 커스텀 헤더를 가지므로 네이티브 헤더는 기본 숨김 */}
                <Stack screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen
                    name="modal"
                    options={{ presentation: 'modal', headerShown: true, title: 'Modal' }}
                  />
                  <Stack.Screen name="kakao-login" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="verification" />
                  <Stack.Screen name="room" />
                  <Stack.Screen name="roommate" />
                  <Stack.Screen name="moderation" />
                  <Stack.Screen name="chat" />
                  <Stack.Screen name="mypage" />
                  <Stack.Screen name="support" />
                  <Stack.Screen name="notifications" />
                </Stack>
                <AppVersionGate />
                <StatusBar style="dark" />
              </AgreementProvider>
            </ModerationProvider>
          </LoginRequiredModalProvider>
        </SessionProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
