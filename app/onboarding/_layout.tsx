import { Stack, useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { saveProfileAll, type ProfileAllRequest } from '@/lib/api';
import { useSession } from '@/lib/domain';
import {
  ONBOARDING_WRITE_ENABLED,
  OnboardingProvider,
  TERM_BACKEND_IDS,
  type OnboardingValues,
  type TermKey,
} from '@/lib/onboarding';

function toRequest(values: OnboardingValues): ProfileAllRequest {
  const { profile, room, terms } = values;
  const birth = profile.birthDate
    ? `${profile.birthDate.getFullYear()}-${String(profile.birthDate.getMonth() + 1).padStart(
        2,
        '0',
      )}-${String(profile.birthDate.getDate()).padStart(2, '0')}`
    : '';
  return {
    name: profile.name,
    birth,
    gender: (profile.gender ?? '').toUpperCase(),
    email: profile.email,
    terms: Object.entries(terms)
      .filter(([, agreed]) => agreed)
      .map(([key]) => TERM_BACKEND_IDS[key as TermKey]),
    lifestyles: Object.entries(profile.scales).map(([k, v]) => `${k}-${v}`),
    type: room.roomType ?? '',
    minDeposit: String(room.deposit.min),
    maxDeposit: String(room.deposit.max),
    minMounthRent: String(room.monthlyRent.min),
    maxMounthRent: String(room.monthlyRent.max),
    comeEnableAt: room.moveInDate ? room.moveInDate.toISOString() : '',
    region: room.region ? [room.region.id] : [],
    roomProfile: [],
    deposit: '',
    mounthRent: '',
  };
}

export default function OnboardingLayout() {
  const router = useRouter();
  const { signIn } = useSession();

  const onComplete = async (values: OnboardingValues) => {
    // 외부 UT: 일괄저장 비활성화 — 저장 없이 완료 처리.
    if (ONBOARDING_WRITE_ENABLED) {
      const res = await saveProfileAll(toRequest(values));
      if (res.error || res.status !== 200) {
        Alert.alert('저장 실패', res.error?.message ?? '잠시 후 다시 시도해주세요.');
        return;
      }
    }
    signIn();
    Alert.alert('온보딩 완료', '기본 프로필 입력이 완료되었어요.', [
      { text: '확인', onPress: () => router.replace('/') },
    ]);
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
