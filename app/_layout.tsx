import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SessionProvider>
        <ModerationProvider>
          <RoomStoreProvider>
            <AgreementProvider>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
                <Stack.Screen name="kakao-login" options={{ title: 'Kakao Login' }} />
                <Stack.Screen name="onboarding" options={{ headerShown: false }} />
                <Stack.Screen name="verification" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </AgreementProvider>
          </RoomStoreProvider>
        </ModerationProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
