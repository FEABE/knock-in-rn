import { Stack, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { OnboardingProvider, type OnboardingValues } from '@/lib/onboarding';

export default function OnboardingLayout() {
  const router = useRouter();

  const onComplete = (values: OnboardingValues) => {
    console.log('onboarding values', values);
    Alert.alert('온보딩 완료', '기본 프로필 입력이 완료되었어요.');
    router.replace('/');
  };

  return (
    <OnboardingProvider onComplete={onComplete}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#ffffff' },
        }}
      />
    </OnboardingProvider>
  );
}
