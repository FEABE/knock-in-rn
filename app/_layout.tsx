import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  AgreementProvider,
  ModerationProvider,
  RoomStoreProvider,
  SessionProvider,
} from '@/lib/domain';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <SessionProvider>
        <ModerationProvider>
          <RoomStoreProvider>
            <AgreementProvider>
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
                <Stack.Screen name="chat" />
                <Stack.Screen name="mypage" />
                <Stack.Screen name="support" />
              </Stack>
              <StatusBar style="auto" />
            </AgreementProvider>
          </RoomStoreProvider>
        </ModerationProvider>
      </SessionProvider>
    </ThemeProvider>
    </QueryClientProvider>
  );
}
